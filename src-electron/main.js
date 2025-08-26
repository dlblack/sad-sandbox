import { app, BrowserWindow, Menu, shell } from 'electron';
import path from 'path';
import { fileURLToPath } from 'url';
import { TextStore} from "../src/utils/TextStore.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const isDev = !!process.env.VITE_DEV_SERVER_URL;

function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    icon: path.join(process.cwd(), 'assets/images', 'favicon.ico'),
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      preload: path.join(__dirname, 'preload.js'),
    },
  });

  if (isDev) {
    win.loadURL(process.env.VITE_DEV_SERVER_URL);
  } else {
    win.loadFile(path.join(process.cwd(), 'dist', 'index.html'));
  }

  const menu = Menu.buildFromTemplate([
    {
      label: TextStore.interface('Navbar_File'),
      submenu: [
        { label: TextStore.interface('Navbar_File_New'),  click: () => win.webContents.send('menu-file', 'create-new') },
        { label: TextStore.interface('Navbar_File_Open'), click: () => win.webContents.send('menu-file', 'open') },
        { label: TextStore.interface('Navbar_File_Close'),click: () => win.webContents.send('menu-file', 'close') },
        { label: TextStore.interface('Navbar_File_Save'), click: () => win.webContents.send('menu-file', 'save') },
        { label: TextStore.interface('Navbar_File_Print'),click: () => win.webContents.send('menu-file', 'print') },
        { type: 'separator' },
        { role: 'quit' },
      ],
    },
    {
      label: TextStore.interface('Navbar_Maps'),
      submenu: [
        { label: TextStore.interface('Navbar_Maps_Open'), click: () => win.webContents.send('menu-maps', 'open-map-window') },
      ],
    },
    {
      label: TextStore.interface('Navbar_Data'),
      submenu: [
        {
          label: TextStore.interface('Navbar_Data_NewData'),
          submenu: [
            { label: TextStore.interface('Navbar_Data_NewData_Manual'),     click: () => win.webContents.send('menu-data', 'manual-data-entry') },
            { label: TextStore.interface('Navbar_Data_NewData_ImportUSGS'), click: () => win.webContents.send('menu-data', 'import-usgs') },
            { label: TextStore.interface('Navbar_Data_NewData_ImportDSS'),  click: () => win.webContents.send('menu-data', 'import-dss') },
          ],
        },
        { label: TextStore.interface('Navbar_Data_EditData'),      click: () => win.webContents.send('menu-data', 'edit-data') },
        { label: TextStore.interface('Navbar_Data_DataUtilities'), click: () => win.webContents.send('menu-data', 'data-utilities') },
      ],
    },
    {
      label: TextStore.interface('Navbar_Analysis'),
      submenu: [
        { label: TextStore.interface('Navbar_Analysis_PeakFlowFrequency'),  click: () => win.webContents.send('menu-analysis', 'PeakFlowFreqWizard') },
        { label: TextStore.interface('Navbar_Analysis_Bulletin17'),         click: () => win.webContents.send('menu-analysis', 'Bulletin17AnalysisWizard') },
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
      ],
    },
    {
      label: TextStore.interface('Navbar_Tools'),
      submenu: [
        { label: TextStore.interface('Navbar_Tools_Contents'),      click: () => win.webContents.send('menu-tools', 'ComponentContent') },
        { label: TextStore.interface('Navbar_Tools_Messages'),      click: () => win.webContents.send('menu-tools', 'ComponentMessage') },
        { label: TextStore.interface('Navbar_Tools_StyleSelector'), click: () => win.webContents.send('menu-tools', 'ComponentStyleSelector') },
        {
          label: TextStore.interface('Navbar_Tools_ToggleDevTools') || 'Toggle Developer Tools',
          accelerator: process.platform === 'darwin' ? 'Alt+Command+I' : 'Ctrl+Shift+I',
          click: () => {
            const focused = BrowserWindow.getFocusedWindow();
            if (focused) focused.webContents.toggleDevTools();
          },
        },
      ],
    },
    {
      label: TextStore.interface('Navbar_Help'),
      submenu: [
        { label: TextStore.interface('Navbar_Help_UsersManual'),        click: () => shell.openExternal('https://www.hec.usace.army.mil/confluence/sspdocs/sspum') },
        { label: TextStore.interface('Navbar_Help_TutorialsAndGuides'), click: () => shell.openExternal('https://www.hec.usace.army.mil/confluence/sspdocs/ssptutorialsguides') },
        { label: TextStore.interface('Navbar_Help_Examples'),           click: () => shell.openExternal('https://www.hec.usace.army.mil/confluence/sspdocs/sspexamples/latest') },
        { label: TextStore.interface('Navbar_Help_Training'),           click: () => shell.openExternal('https://www.hec.usace.army.mil/confluence/sspdocs/sspum') },
        { type: 'separator' },
        { label: TextStore.interface('Navbar_Help_InstallExampleData'), click: () => win.webContents.send('menu-help', 'install-example-data') },
        { type: 'separator' },
        { label: TextStore.interface('Navbar_Help_TermsAndConditions'), click: () => shell.openExternal('https://www.hec.usace.army.mil/software/terms_and_conditions.aspx') },
        { label: TextStore.interface('Navbar_Help_About'),              click: () => win.webContents.send('menu-help', 'about-hec-neptune') },
      ],
    },
  ]);

  Menu.setApplicationMenu(menu);
}

app.whenReady().then(createWindow);
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
