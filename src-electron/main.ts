import { app, BrowserWindow, Menu, MenuItemConstructorOptions, shell } from "electron";
import path from "path";
import { fileURLToPath } from "url";
import { TextStore } from "../src/utils/TextStore";
import fs from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Vite dev server flag provided by vite-plugin-electron
const isDev = !!process.env.VITE_DEV_SERVER_URL;

// Make text crisper on high-DPI displays (optional)
app.commandLine.appendSwitch("high-dpi-support", "1");
app.commandLine.appendSwitch("force-device-scale-factor", "1");

function createWindow(): void {
  const preloadPath = path.join(__dirname, 'preload.js');
  console.log('[Electron] __dirname:', __dirname);
  console.log('[Electron] preload path:', preloadPath, 'exists:', fs.existsSync(preloadPath));

  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    icon: path.join(process.cwd(), 'assets/images', 'favicon.ico'),
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
      preload: preloadPath,
      zoomFactor: 0.75,
    },
  });

  if (isDev) {
    // Dev: load the Vite dev server URL
    win.loadURL(process.env.VITE_DEV_SERVER_URL!);
  } else {
    // Prod: load the bundled index.html
    win.loadFile(path.join(process.cwd(), "dist", "index.html"));
  }

  // Optional: prevent pinch zoom
  app.on("browser-window-created", (_evt, w) => {
    try {
      w.webContents.setVisualZoomLevelLimits(1, 1);
    } catch {
      // ignore
    }
  });

  const template: MenuItemConstructorOptions[] = [
    {
      label: TextStore.interface("Navbar_File"),
      submenu: [
        { label: TextStore.interface("Navbar_File_New"),   click: () => win.webContents.send("menu-file", "create-new") },
        { label: TextStore.interface("Navbar_File_Open"),  click: () => win.webContents.send("menu-file", "open") },
        { label: TextStore.interface("Navbar_File_Close"), click: () => win.webContents.send("menu-file", "close") },
        { label: TextStore.interface("Navbar_File_Save"),  click: () => win.webContents.send("menu-file", "save") },
        { label: TextStore.interface("Navbar_File_Print"), click: () => win.webContents.send("menu-file", "print") },
        { type: "separator" },
        { role: "quit" },
      ],
    },
    {
      label: TextStore.interface("Navbar_Maps"),
      submenu: [
        {
          label: TextStore.interface("Navbar_Maps_Open"),
          click: () => win.webContents.send("menu-maps", "open-map-window"),
        },
      ],
    },
    {
      label: TextStore.interface("Navbar_Data"),
      submenu: [
        {
          label: TextStore.interface("Navbar_Data_NewData"),
          submenu: [
            {
              label: TextStore.interface("Navbar_Data_NewData_Manual"),
              click: () => win.webContents.send("menu-data", "manual-data-entry"),
            },
            {
              label: TextStore.interface("Navbar_Data_NewData_ImportUSGS"),
              click: () => win.webContents.send("menu-data", "import-usgs"),
            },
            {
              label: TextStore.interface("Navbar_Data_NewData_ImportDSS"),
              click: () => win.webContents.send("menu-data", "import-dss"),
            },
          ],
        },
        {
          label: TextStore.interface("Navbar_Data_EditData"),
          click: () => win.webContents.send("menu-data", "edit-data"),
        },
        {
          label: TextStore.interface("Navbar_Data_DataUtilities"),
          click: () => win.webContents.send("menu-data", "data-utilities"),
        },
      ],
    },
    {
      label: TextStore.interface("Navbar_Analysis"),
      submenu: [
        {
          label: TextStore.interface("Navbar_Analysis_Bulletin17"),
          click: () => win.webContents.send("menu-analysis", "Bulletin17AnalysisWizard"),
        },
        {
          label: TextStore.interface("Navbar_Analysis_FloodTypeClass"),
          click: () => win.webContents.send("menu-analysis", "FloodTypeClassAnalysisWizard"),
        },
        {
          label: TextStore.interface("Navbar_Analysis_PeakFlowFrequency"),
          click: () => win.webContents.send("menu-analysis", "PeakFlowFreqWizard"),
        },
        // Additional items kept commented as in your original:
        /*
        { label: TextStore.interface('Navbar_Analysis_GeneralFrequencyAnalysis'), click: () => win.webContents.send('menu-analysis', 'GeneralFreqAnalysisWizard') },
        { label: TextStore.interface('Navbar_Analysis_VolumeFrequencyAnalysis'),  click: () => win.webContents.send('menu-analysis', 'VolumeFreqAnalysisWizard') },
        { label: TextStore.interface('Navbar_Analysis_CoincidentFrequencyAnalysis'), click: () => win.webContents.send('menu-analysis', 'CoincidentFreqAnalysisWizard') },
        { label: TextStore.interface('Navbar_Analysis_CurveCombinationAnalysis'), click: () => win.webContents.send('menu-analysis', 'CurveCombinationAnalysisWizard') },
        { label: TextStore.interface('Navbar_Analysis_BalancedHydrographAnalysis'), click: () => win.webContents.send('menu-analysis', 'BalancedHydrographAnalysisWizard') },
        { label: TextStore.interface('Navbar_Analysis_DistributionFittingAnalysis'), click: () => win.webContents.send('menu-analysis', 'DistributionFittingAnalysisWizard') },
        { label: TextStore.interface('Navbar_Analysis_MixedPopulationAnalysis'), click: () => win.webContents.send('menu-analysis', 'MixedPopulationAnalysisWizard') },
        { label: TextStore.interface('Navbar_Analysis_CorrelationAnalysis'), click: () => win.webContents.send('menu-analysis', 'CorrelationAnalysisWizard') },
        { label: TextStore.interface('Navbar_Analysis_RecordExtensionAnalysis'), click: () => win.webContents.send('menu-analysis', 'RecordExtensionAnalysisWizard') },
        { label: TextStore.interface('Navbar_Analysis_PeaksOverThresholdAnalysis'), click: () => win.webContents.send('menu-analysis', 'PeaksOverThresholdAnalysisWizard') },
        { label: TextStore.interface('Navbar_Analysis_LinearRegression'), click: () => win.webContents.send('menu-analysis', 'LinearRegressionWizard') },
        { label: TextStore.interface('Navbar_Analysis_QuantileMapping'),  click: () => win.webContents.send('menu-analysis', 'QuantileMappingWizard') },
        { label: TextStore.interface('Navbar_Analysis_CopulaAnalysis'),   click: () => win.webContents.send('menu-analysis', 'CopulaAnalysisWizard') },
        */
      ],
    },
    {
      label: TextStore.interface("Navbar_Tools"),
      submenu: [
        {
          label: TextStore.interface("Navbar_Tools_Project"),
          click: () => win.webContents.send("menu-tools", "ComponentProject"),
        },
        {
          label: TextStore.interface("Navbar_Tools_Messages"),
          click: () => win.webContents.send("menu-tools", "ComponentMessage"),
        },
        {
          label: TextStore.interface("Navbar_Tools_View_InterfaceSize"),
          click: () => win.webContents.send("menu-tools", "ComponentInterfaceOptions"),
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
          click: () => shell.openExternal("https://www.hec.usace.army.mil/confluence/sspdocs/ssptutorialsguides"),
        },
        {
          label: TextStore.interface("Navbar_Help_Examples"),
          click: () => shell.openExternal("https://www.hec.usace.army.mil/confluence/sspdocs/sspexamples/latest"),
        },
        {
          label: TextStore.interface("Navbar_Help_Training"),
          click: () => shell.openExternal("https://www.hec.usace.army.mil/confluence/sspdocs/sspum"),
        },
        { type: "separator" },
        {
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
        { label: "Demo Plots (Plotly)",    click: () => win.webContents.send("menu-tools", "DemoPlots") },
        { label: "Demo Plots (Recharts)",  click: () => win.webContents.send("menu-tools", "DemoPlotsRecharts") },
      ],
    },
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

app.whenReady().then(createWindow);

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
