import { app, BrowserWindow, Menu, shell } from "electron";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    icon: path.join(__dirname, 'assets/images', 'favicon.ico'),
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
    },
  });
  
  const startUrl = process.env.ELECTRON_START_URL || `file://${path.join(__dirname, 'dist/index.html')}`;
  win.loadURL(startUrl);


  // ---- Electron Menu Structure ----
  const menuTemplate = [
    {
      label: "File",
      submenu: [
        { label: "Create New...", click: () => win.webContents.send("menu-file", "create-new") },
        { label: "Open...", click: () => win.webContents.send("menu-file", "open") },
        { label: "Close...", click: () => win.webContents.send("menu-file", "close") },
        { label: "Save...", click: () => win.webContents.send("menu-file", "save") },
        { label: "Print...", click: () => win.webContents.send("menu-file", "print") },
        { type: "separator" },
        { role: "quit" }
      ]
    },
    {
      label: "Maps",
      submenu: [
        { label: "Open Map Window", click: () => win.webContents.send("menu-maps", "open-map-window") }
      ]
    },
    {
      label: "Data",
      submenu: [
        { label: "Manual Data Entry", click: () => win.webContents.send("menu-data", "manual-data-entry") },
        { label: "USGS", click: () => win.webContents.send("menu-data", "usgs") },
        { label: "HEC-DSS", click: () => win.webContents.send("menu-data", "hec-dss") },
        { label: "Data Utilities", click: () => win.webContents.send("menu-data", "data-utilities") }
      ]
    },
    {
      label: "Analysis",
      submenu: [
        { label: "New Peak Flow Frequency", click: () => win.webContents.send("menu-analysis", "PeakFlowFreqWizard") },
        { label: "New Bulletin 17 Analysis", click: () => win.webContents.send("menu-analysis", "Bulletin17AnalysisWizard") },
        { label: "New General Frequency Analysis", click: () => win.webContents.send("menu-analysis", "GeneralFreqAnalysisWizard") },
        { label: "New Volume Frequency Analysis", click: () => win.webContents.send("menu-analysis", "VolumeFreqAnalysisWizard") },
        { label: "New Coincident Frequency Analysis", click: () => win.webContents.send("menu-analysis", "CoincidentFreqAnalysisWizard") },
        { label: "New Curve Combination Analysis", click: () => win.webContents.send("menu-analysis", "CurveCombinationAnalysisWizard") },
        { label: "New Balanced Hydrograph Analysis", click: () => win.webContents.send("menu-analysis", "BalancedHydrographAnalysisWizard") },
        { label: "New Distribution Fitting Analysis", click: () => win.webContents.send("menu-analysis", "DistributionFittingAnalysisWizard") },
        { label: "New Mixed Population Analysis", click: () => win.webContents.send("menu-analysis", "MixedPopulationAnalysisWizard") },
        { label: "New Correlation Analysis", click: () => win.webContents.send("menu-analysis", "CorrelationAnalysisWizard") },
        { label: "New Record Extension Analysis", click: () => win.webContents.send("menu-analysis", "RecordExtensionAnalysisWizard") },
        { label: "New Peaks Over Threshold Analysis", click: () => win.webContents.send("menu-analysis", "PeaksOverThresholdAnalysisWizard") },
        { label: "New Linear Regression", click: () => win.webContents.send("menu-analysis", "LinearRegressionWizard") },
        { label: "New Quantile Mapping", click: () => win.webContents.send("menu-analysis", "QuantileMappingWizard") },
        { label: "New Copula Analysis", click: () => win.webContents.send("menu-analysis", "CopulaAnalysisWizard") }
      ]
    },
    {
      label: "Tools",
      submenu: [
        { label: "Contents", click: () => win.webContents.send("menu-tools", "ComponentContent") },
        { label: "Messages", click: () => win.webContents.send("menu-tools", "ComponentMessage") },
        { label: "Style Selector", click: () => win.webContents.send("menu-tools", "ComponentStyleSelector") },
        {
          label: "Toggle Developer Tools",
          accelerator: process.platform === "darwin" ? "Alt+Command+I" : "Ctrl+Shift+I",
          click: () => {
            const focusedWindow = BrowserWindow.getFocusedWindow();
            if (focusedWindow) focusedWindow.webContents.toggleDevTools();
          }
        }
      ]
    },    
    {
      label: "Help",
      submenu: [
        { label: "User's Manual", click: () => shell.openExternal("https://www.hec.usace.army.mil/confluence/sspdocs/sspum") },
        { label: "Tutorials and Guides", click: () => shell.openExternal("https://www.hec.usace.army.mil/confluence/sspdocs/ssptutorialsguides") },
        { label: "Examples", click: () => shell.openExternal("https://www.hec.usace.army.mil/confluence/sspdocs/sspexamples/latest") },
        { label: "Training", click: () => shell.openExternal("https://www.hec.usace.army.mil/confluence/sspdocs/sspum") },
        { type: "separator" },
        { label: "Install Example Data", click: () => win.webContents.send("menu-help", "install-example-data") },
        { type: "separator" },
        { label: "Terms and Conditions for Use", click: () => shell.openExternal("https://www.hec.usace.army.mil/software/terms_and_conditions.aspx") },
        { label: "About HEC-Neptune", click: () => win.webContents.send("menu-help", "about-hec-neptune") }
      ]
    }
  ];

  const menu = Menu.buildFromTemplate(menuTemplate);
  Menu.setApplicationMenu(menu);
  // -------------------------------------------
}

app.whenReady().then(createWindow);

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
