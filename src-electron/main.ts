import { app, BrowserWindow, Menu, MenuItemConstructorOptions, shell, ipcMain, dialog } from "electron";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";
import { TextStore } from "../src/utils/TextStore";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const isDev = !!process.env.VITE_DEV_SERVER_URL;

app.commandLine.appendSwitch("high-dpi-support", "1");
app.commandLine.appendSwitch("force-device-scale-factor", "1");

type PopoutOpenPayload = {
  id: string;
  title: string;
  kind: string;
  ownerKey?: string;
  bounds?: { x?: number; y?: number; width?: number; height?: number };
};

const popoutWindows = new Map<string, BrowserWindow>();
const popoutModels = new Map<string, unknown>();

const boundsFile = path.join(app.getPath("userData"), "popouts.bounds.json");

function readBoundsStore(): Record<string, any> {
  try {
    if (!fs.existsSync(boundsFile)) return {};
    const raw = fs.readFileSync(boundsFile, "utf8");
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

function writeBoundsStore(store: Record<string, any>): void {
  try {
    fs.writeFileSync(boundsFile, JSON.stringify(store, null, 2), "utf8");
  } catch {
    // ignore
  }
}

function getSavedBounds(id: string): any | undefined {
  const store = readBoundsStore();
  return store[id];
}

function saveBounds(id: string, b: any): void {
  const store = readBoundsStore();
  store[id] = b;
  writeBoundsStore(store);
}

/**
 * IMPORTANT:
 * - Dev: BrowserRouter route "/popout" works as "http://localhost:5173/popout?id=..."
 * - Prod (file://): BrowserRouter can't resolve "/popout" from file://, so we use hash:
 *   "file:///.../index.html#/popout?id=..."
 */
function popoutUrl(id: string): string {
  if (isDev) {
    return `${process.env.VITE_DEV_SERVER_URL!}popout?id=${encodeURIComponent(id)}`;
  }
  const index = path.join(process.cwd(), "dist", "index.html");
  return `file://${index}#/popout?id=${encodeURIComponent(id)}`;
}

// IPC: open popout window
ipcMain.handle("popout:open", async (_evt, payload: PopoutOpenPayload) => {
  const existing = popoutWindows.get(payload.id);
  if (existing && !existing.isDestroyed()) {
    existing.focus();
    return;
  }

  const preloadPath = path.join(__dirname, "preload.js");
  const saved = getSavedBounds(payload.id);
  const b = payload.bounds ?? saved ?? {};

  const win = new BrowserWindow({
    width: Math.max(300, Math.floor(b.width ?? 1100)),
    height: Math.max(200, Math.floor(b.height ?? 700)),
    x: typeof b.x === "number" ? Math.floor(b.x) : undefined,
    y: typeof b.y === "number" ? Math.floor(b.y) : undefined,
    title: payload.title,
    resizable: true,
    icon: path.join(process.cwd(), "assets/images", "favicon.ico"),
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
      preload: preloadPath,
      zoomFactor: 0.75,
    },
  });

  popoutWindows.set(payload.id, win);

  win.on("close", () => {
    try {
      saveBounds(payload.id, win.getBounds());
    } catch {}
  });

  win.on("closed", () => {
    popoutWindows.delete(payload.id);

    // notify main renderer(s) so they can update UI placeholder state if needed
    for (const w of BrowserWindow.getAllWindows()) {
      if (!w.isDestroyed()) w.webContents.send("popout:message", { type: "POPOUT:CLOSE", id: payload.id });
    }
  });

  await win.loadURL(popoutUrl(payload.id));

  // If we already have a model, push it once the popout renderer is ready
  win.webContents.once("did-finish-load", () => {
    const m = popoutModels.get(payload.id);
    if (m) {
      win.webContents.send("popout:message", {
        type: "POPOUT:MODEL",
        id: payload.id,
        kind: payload.kind,
        model: m,
      });
    }
  });
});

// IPC: close popout window
ipcMain.on("popout:close", (_evt, id: string) => {
  const win = popoutWindows.get(id);
  if (win && !win.isDestroyed()) win.close();
});

// IPC: relay messages between main renderer <-> popout window
ipcMain.on("popout:message", (_evt, msg: any) => {
  if (!msg || typeof msg !== "object" || !msg.id) return;

  // Main renderer sends model updates -> main stores + forwards to the popout window
  if (msg.type === "POPOUT:MODEL") {
    popoutModels.set(msg.id, msg.model);
    const win = popoutWindows.get(msg.id);
    if (win && !win.isDestroyed()) win.webContents.send("popout:message", msg);
    return;
  }

  // Popout asks for refresh -> broadcast to all app windows (main renderer handles it)
  if (msg.type === "POPOUT:REFRESH_REQUEST") {
    for (const w of BrowserWindow.getAllWindows()) {
      if (!w.isDestroyed()) w.webContents.send("popout:message", msg);
    }
    return;
  }

  // Popout reports bounds -> persist + broadcast (optional, for debugging/telemetry/UI)
  if (msg.type === "POPOUT:BOUNDS") {
    try {
      saveBounds(msg.id, msg.bounds);
    } catch {}
    for (const w of BrowserWindow.getAllWindows()) {
      if (!w.isDestroyed()) w.webContents.send("popout:message", msg);
    }
    return;
  }
});

// IPC: allow popout renderer to fetch the last model immediately on load
ipcMain.handle("popout:getModel", async (_evt, id: string) => {
  return popoutModels.get(id) ?? null;
});

function createWindow(): void {
  const preloadPath = path.join(__dirname, "preload.js");
  console.log("[Electron] __dirname:", __dirname);
  console.log("[Electron] preload path:", preloadPath, "exists:", fs.existsSync(preloadPath));

  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    icon: path.join(process.cwd(), "assets/images", "favicon.ico"),
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
      preload: preloadPath,
      zoomFactor: 0.75,
    },
  });

  if (isDev) {
    win.loadURL(process.env.VITE_DEV_SERVER_URL!);
  } else {
    win.loadFile(path.join(process.cwd(), "dist", "index.html"));
  }

  app.on("browser-window-created", (_evt, w) => {
    try {
      w.webContents.setVisualZoomLevelLimits(1, 1);
    } catch {}
  });

  const template: MenuItemConstructorOptions[] = [
    {
      label: TextStore.interface("Navbar_File"),
      submenu: [
        {
          id: "file-new",
          label: TextStore.interface("Navbar_File_New"),
          click: () => win.webContents.send("menu-file", "create-new"),
        },
        {
          id: "file-open",
          label: TextStore.interface("Navbar_File_Open"),
          click: () => win.webContents.send("menu-file", "open"),
        },
        {
          id: "file-close",
          label: TextStore.interface("Navbar_File_Close"),
          click: () => win.webContents.send("menu-file", "close"),
        },
        {
          id: "file-save",
          label: TextStore.interface("Navbar_File_Save"),
          click: () => win.webContents.send("menu-file", "save"),
        },
        { type: "separator" },
        { role: "quit" },
      ],
    },
    {
      label: TextStore.interface("Navbar_Maps"),
      submenu: [
        {
          id: "maps-open",
          label: TextStore.interface("Navbar_Maps_Open"),
          click: () => win.webContents.send("menu-maps", "open-map-window"),
        },
      ],
    },
    {
      id: "menu-data",
      label: TextStore.interface("Navbar_Data"),
      submenu: [
        {
          label: TextStore.interface("Navbar_Data_NewData"),
          submenu: [
            {
              id: "data-new-manual",
              label: TextStore.interface("Navbar_Data_NewData_Manual"),
              click: () => win.webContents.send("menu-data", "manual-data-entry"),
            },
            {
              id: "data-new-usgs",
              label: TextStore.interface("Navbar_Data_NewData_ImportUSGS"),
              click: () => win.webContents.send("menu-data", "import-usgs"),
            },
            {
              id: "data-new-dss",
              label: TextStore.interface("Navbar_Data_NewData_ImportDSS"),
              click: () => win.webContents.send("menu-data", "import-dss"),
            },
          ],
        },
        {
          id: "data-edit",
          label: TextStore.interface("Navbar_Data_EditData"),
          click: () => win.webContents.send("menu-data", "edit-data"),
        },
        {
          id: "data-utils",
          label: TextStore.interface("Navbar_Data_DataUtilities"),
          click: () => win.webContents.send("menu-data", "data-utilities"),
        },
      ],
    },
    {
      id: "menu-analysis",
      label: TextStore.interface("Navbar_Analysis"),
      submenu: [
        {
          id: "analysis-b17",
          label: TextStore.interface("Navbar_Analysis_Bulletin17"),
          click: () => win.webContents.send("menu-analysis", "Bulletin17AnalysisWizard"),
        },
        {
          id: "analysis-cop",
          label: TextStore.interface("Navbar_Analysis_Copula"),
          click: () => win.webContents.send("menu-analysis", "CopulaAnalysisWizard"),
        },
        {
          id: "analysis-ftc",
          label: TextStore.interface("Navbar_Analysis_FloodTypeClass"),
          click: () => win.webContents.send("menu-analysis", "FloodTypeClassAnalysisWizard"),
        },
        {
          id: "analysis-peak",
          label: TextStore.interface("Navbar_Analysis_PeakFlowFrequency"),
          click: () => win.webContents.send("menu-analysis", "PeakFlowFreqWizard"),
        },
      ],
    },
    {
      id: "menu-tools",
      label: TextStore.interface("Navbar_Tools"),
      submenu: [
        {
          id: "tools-project",
          label: TextStore.interface("Navbar_Tools_Project"),
          click: () => win.webContents.send("menu-tools", "ComponentProject"),
        },
        {
          id: "tools-messages",
          label: TextStore.interface("Navbar_Tools_Messages"),
          click: () => win.webContents.send("menu-tools", "ComponentMessage"),
        },
        {
          id: "tools-interface",
          label: TextStore.interface("Navbar_Tools_View_InterfaceSize"),
          click: () => win.webContents.send("menu-tools", "ComponentInterfaceOptions"),
        },
        {
          id: "tools-plotstyle",
          label: TextStore.interface("Navbar_Tools_View_PlotStyle"),
          click: () => win.webContents.send("menu-tools", "ComponentPlotStyle"),
        },
        {
          label: TextStore.interface("Navbar_Tools_ToggleDevTools"),
          accelerator: process.platform === "darwin" ? "Alt+Command+I" : "Ctrl+Shift+I",
          click: () => {
            const focused = BrowserWindow.getFocusedWindow();
            if (focused) focused.webContents.toggleDevTools();
          },
        },
      ],
    },
    {
      label: TextStore.interface("Navbar_Help"),
      submenu: [
        {
          label: TextStore.interface("Navbar_Help_UsersManual"),
          click: () => shell.openExternal("https://www.hec.usace.army.mil/confluence/sspdocs/sspum"),
        },
        {
          label: TextStore.interface("Navbar_Help_TutorialsAndGuides"),
          click: () =>
              shell.openExternal("https://www.hec.usace.army.mil/confluence/sspdocs/ssptutorialsguides"),
        },
        {
          label: TextStore.interface("Navbar_Help_Examples"),
          click: () =>
              shell.openExternal("https://www.hec.usace.army.mil/confluence/sspdocs/sspexamples/latest"),
        },
        {
          label: TextStore.interface("Navbar_Help_Training"),
          click: () => shell.openExternal("https://www.hec.usace.army.mil/confluence/sspdocs/sspum"),
        },
        { type: "separator" },
        {
          id: "help-install-examples",
          label: TextStore.interface("Navbar_Help_InstallExampleData"),
          click: () => win.webContents.send("menu-help", "install-example-data"),
        },
        { type: "separator" },
        {
          label: TextStore.interface("Navbar_Help_TermsAndConditions"),
          click: () =>
              shell.openExternal("https://www.hec.usace.army.mil/software/terms_and_conditions.aspx"),
        },
        {
          label: TextStore.interface("Navbar_Help_About"),
          click: () => win.webContents.send("menu-help", "about-hec-necptune"),
        },
        { type: "separator" },
        {
          id: "help-demoplots-plotly",
          label: "Demo Plots (Plotly)",
          click: () => win.webContents.send("menu-tools", "DemoPlots"),
        },
        {
          id: "help-demoplots-recharts",
          label: "Demo Plots (Recharts)",
          click: () => win.webContents.send("menu-tools", "DemoPlotsRecharts"),
        },
      ],
    },
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);

  function setProjectMenusEnabled(enabled: boolean) {
    const idsToFlip = [
      "file-close",
      "file-save",
      "maps-open",
      "data-new-manual",
      "data-new-usgs",
      "data-new-dss",
      "data-edit",
      "data-utils",
      "analysis-b17",
      "analysis-cop",
      "analysis-ftc",
      "analysis-peak",
      "tools-project",
      "tools-messages",
      "tools-interface",
      "tools-plotstyle",
      "help-demoplots-plotly",
      "help-demoplots-recharts",
    ];
    const m = Menu.getApplicationMenu();
    if (!m) return;
    for (const id of idsToFlip) {
      const item = m.getMenuItemById(id);
      if (item) item.enabled = enabled;
    }
  }

  // Start disabled on HomePage
  setProjectMenusEnabled(false);

  // Renderer tells us when a project opens/closes
  ipcMain.on("menu:project-state", (_e, projectOpen: boolean) => {
    setProjectMenusEnabled(projectOpen);
  });

  ipcMain.handle("dialog:openFolder", async () => {
    const result = await dialog.showOpenDialog({ properties: ["openDirectory"] });
    return result.filePaths[0] || null;
  });

  ipcMain.handle("dialog:openFile", async () => {
    const result = await dialog.showOpenDialog({
      properties: ["openFile"],
      filters: [{ name: "Neptune Project", extensions: ["neptune"] }],
    });
    return result.filePaths[0] || null;
  });
}

ipcMain.handle("file:readText", async (_e, filePath: string) => {
  return fs.promises.readFile(filePath, "utf-8");
});

app.whenReady().then(createWindow);

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
