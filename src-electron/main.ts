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
          click: () =>
              shell.openExternal("https://www.hec.usace.army.mil/confluence/sspdocs/sspum"),
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
          click: () =>
              shell.openExternal("https://www.hec.usace.army.mil/confluence/sspdocs/sspum"),
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
          click: () => win.webContents.send("menu-help", "about-hec-neptune"),
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
