/* eslint-disable @typescript-eslint/no-explicit-any */

export const INTERFACE_TEXT = {
  // --------------------------------------
  // HomePage
  // --------------------------------------
  HomePage_Title: "HEC-Neptune",
  HomePage_CreateNewProject: "Create New Project",
  HomePage_CreateProject_Name_L: "Project Name",
  HomePage_CreateProject_Name_P: "Enter project name",
  HomePage_CreateProject_Directory_L: "Directory",
  HomePage_CreateProject_Directory_P: "Select project directory",
  HomePage_CreateProject_UnitSystem_L: "Default Unit System",
  HomePage_CreateProject_UnitSystem_US: "U.S. Customary",
  HomePage_CreateProject_UnitSystem_SI: "SI (Metric)",
  HomePage_CreateProject_ButtonCreate: "Create Project",
  HomePage_OpenExistingProject: "Open Existing Project",
  HomePage_ButtonBrowseForProject: "Browse for Project",
  HomePage_RecentProjects_L: "Recent Projects",
  HomePage_NoRecentProjects: "No recent projects.",

  // --------------------------------------
  // Navbar
  // --------------------------------------
  Navbar_File: "File",
  Navbar_File_New: "New... ",
  Navbar_File_New_L: "Create New Project",
  Navbar_File_New_ProjectName: "Project Name",
  Navbar_File_New_ProjectName_D: "Enter project name",
  Navbar_File_New_DirectoryLocation: "Directory Location",
  Navbar_File_New_DirectoryLocation_D: "C:/Projects/MyProject",
  Navbar_File_New_UnitSystem: "Default Unit System",
  Navbar_File_Open: "Open...",
  Navbar_File_Close: "Close ",
  Navbar_File_Save: "Save... ",
  Navbar_Maps: "Maps",
  Navbar_Maps_Open: "Open Map Window",
  Navbar_Data: "Data",
  Navbar_Data_NewData: "New Data",
  Navbar_Data_NewData_Manual: "Manual Data Entry",
  Navbar_Data_NewData_ImportUSGS: "Import from USGS",
  Navbar_Data_NewData_ImportDSS: "Import from HEC-DSS",
  Navbar_Data_EditData: "Edit Data",
  Navbar_Data_DataUtilities: "Data Utilities",
  Navbar_Analysis: "Analysis",
  Navbar_Analysis_Bulletin17: "New Bulletin 17 Analysis",
  Navbar_Analysis_Copula: "New Copula Analysis",
  Navbar_Analysis_FloodTypeClass: "New Flood Type Classification Analysis",
  Navbar_Analysis_PeakFlowFrequency: "New Peak Flow Frequency",
  Navbar_Tools: "Tools",
  Navbar_Tools_Project: "Project",
  Navbar_Tools_Messages: "Messages",
  Navbar_Tools_View: "View",
  Navbar_Tools_View_InterfaceSize: "Options",
  Navbar_Tools_View_PlotStyle: "Plot Styles",
  Navbar_Tools_ToggleDevTools: "Toggle DevTools",
  Navbar_Help: "Help",
  Navbar_Help_UsersManual: "User's Manual",
  Navbar_Help_TutorialsAndGuides: "Tutorials and Guides",
  Navbar_Help_Examples: "Examples",
  Navbar_Help_Training: "Training",
  Navbar_Help_InstallExampleData: "Install Example Data",
  Navbar_Help_TermsAndConditions: "Terms And Conditions",
  Navbar_Help_About: "About HEC-Neptune",
  Navbar_Search_Placeholder: "Search",

  // --------------------------------------
  // ComponentInterfaceOptions
  // --------------------------------------
  ComponentInterfaceOptions_InterfaceOptions_Label: "Interface Options",
  ComponentInterfaceOptions_ColorScheme: "Color scheme",
  ComponentInterfaceOptions_StyleOption_Auto: "System",
  ComponentInterfaceOptions_StyleOption_Light: "Light",
  ComponentInterfaceOptions_StyleOption_Dark: "Dark",
  ComponentInterfaceOptions_CurrentScheme: "Current Scheme",
  ComponentInterfaceOptions_HeaderPrefix: "UI",
  ComponentInterfaceOptions_InterfaceScaleSlider: "Interface scale slider",
  ComponentInterfaceOptions_ResetButton: "Reset",
  ComponentInterfaceOptions_ResetTitle: "Reset Interface to defaults.",
  ComponentInterfaceOptions_Density: "Density",
  ComponentInterfaceOptions_Density_Compact: "Compact",
  ComponentInterfaceOptions_Density_Standard: "Standard",
  ComponentInterfaceOptions_Density_Comfy: "Comfy",
  ComponentInterfaceOptions_DefaultProjectRoot_Label: "Default Project Location",
  ComponentInterfaceOptions_DefaultProjectRoot_Save_Button: "Save",

  // --------------------------------------
  // ComponentPlotStyle
  // --------------------------------------
  ComponentPlotStyle_PlotDefaults: "Plot Defaults",
  ComponentPlotStyle_Message: "These settings define default styles by rule. Plots will read these rules and apply them automatically.",
  ComponentPlotStyle_KindLabel: "Kind",
  ComponentPlotStyle_Kind_TimeSeries: "Time Series",
  ComponentPlotStyle_Kind_PairedXY: "Paired XY",
  ComponentPlotStyle_Kind_FrequencyCurve: "Frequency Curve",
  ComponentPlotStyle_Kind_Scatter: "Scatter",
  ComponentPlotStyle_ParameterLabel: "Parameter",
  ComponentPlotStyle_Parameter_Flow: "Flow",
  ComponentPlotStyle_Parameter_Precipitation: "Precipitation",
  ComponentPlotStyle_Parameter_Stage: "Stage",
  ComponentPlotStyle_Parameter_Storage: "Storage",
  ComponentPlotStyle_Parameter_Temperature: "Temperature",
  ComponentPlotStyle_StyleLabel: "Style",
  ComponentPlotStyle_Style_DrawLine: "Draw line",
  ComponentPlotStyle_Style_DrawPoints: "Draw points",
  ComponentPlotStyle_Style_LineColor: "Line color",
  ComponentPlotStyle_Style_LineWidth: "Line width",
  ComponentPlotStyle_Style_Dash: "Dash",
  ComponentPlotStyle_Style_Dash_Solid: "Solid",
  ComponentPlotStyle_Style_Dash_Dash: "Dash",
  ComponentPlotStyle_Style_Dash_Dot: "Dot",
  ComponentPlotStyle_Style_Dash_DashDot: "Dashdot",
  ComponentPlotStyle_Style_Dash_LongDash: "Longdash",
  ComponentPlotStyle_Style_Dash_LongDashDot: "Longdashdot",
  ComponentPlotStyle_Style_PointFill: "Point fill",
  ComponentPlotStyle_Style_PointLine: "Point line",
  ComponentPlotStyle_Style_PointSize: "Point size",
  ComponentPlotStyle_Button_ResetRule: "Reset Rule",
  ComponentPlotStyle_Button_SaveRule: "Save Rule",

  // --------------------------------------
  // componentRegistry
  // --------------------------------------
  ComponentRegistry_ComponentProject: "Project",
  ComponentRegistry_ComponentInterfaceOptions: "Options",
  ComponentRegistry_ComponentPlotStyle: "Plot Styles",
  ComponentRegistry_ManualDataEntryEditor: "Manual Data Entry",
  ComponentRegistry_UsgsDataImporter: "USGS Data Importer",
  ComponentRegistry_Wizard_Bulletin17AnalysisWizard: "Bulletin 17 Analysis",
  ComponentRegistry_Wizard_CopulaAnalysisWizard: "Copula Analysis",
  ComponentRegistry_Wizard_FloodTypeClassAnalysisWizard: "Flood Type Classification Analysis",
  ComponentRegistry_Wizard_PeakFlowFreqWizard: "Peak Flow Frequency",

  // --------------------------------------
  // DataIntervalComboBox
  // --------------------------------------
  DataInterval_Placeholder: "Select Data Interval",
  DataInterval_IRDay: "IR-Day",
  DataInterval_IRMonth: "IR-Month",
  DataInterval_IRYear: "IR-Year",
  DataInterval_IRDecade: "IR-Decade",
  DataInterval_IRCentury: "IR-Century",
  DataInterval_1MIN: "1 Minute",
  DataInterval_2MIN: "2 Minute",
  DataInterval_3MIN: "3 Minute",
  DataInterval_4MIN: "4 Minute",
  DataInterval_5MIN: "5 Minute",
  DataInterval_6MIN: "6 Minute",
  DataInterval_10MIN: "10 Minute",
  DataInterval_12MIN: "12 Minute",
  DataInterval_15MIN: "15 Minutes",
  DataInterval_20MIN: "20 Minute",
  DataInterval_30MIN: "30 Minutes",
  DataInterval_1HOUR: "1 Hour",
  DataInterval_2HOUR: "2 Hours",
  DataInterval_3HOUR: "3 Hours",
  DataInterval_4HOUR: "4 Hours",
  DataInterval_6HOUR: "6 Hours",
  DataInterval_8HOUR: "8 Hours",
  DataInterval_12HOUR: "12 Hours",
  DataInterval_1DAY: "1 Day",
  DataInterval_1WK: "1 Week",
  DataInterval_1MON: "1 Month",
  DataInterval_1YEAR: "1 Year",
  DataInterval_TriMonth: "Tri-Month",
  DataInterval_SemiMonth: "Semi-Month",

  // --------------------------------------
  // DataUnitComboBox
  // --------------------------------------
  DataUnit_Placeholder: "Select Data Unit",
  DataUnitGroup_Precipitation: "Precipitation",
  DataUnitGroup_Flow: "Flow",
  DataUnitGroup_Stage: "Stage",
  DataUnitGroup_Elev: "Elevation",
  DataUnitGroup_SWE: "SWE",
  DataUnitGroup_Temperature: "Temperature",
  DataUnitGroup_Windspeed: "Windspeed",
  DataUnit_Precip_IncIn: "Incremental Inches",
  DataUnit_Precip_IncMM: "Incremental Millimeters",
  DataUnit_Precip_CumIn: "Cumulative Inches",
  DataUnit_Precip_CumMM: "Cumulative Millimeters",
  DataUnit_Flow_CFS: "Cubic Feet per Second (cfs)",
  DataUnit_Flow_CMS: "Cubic Meters per Second (cms)",
  DataUnit_Stage_ft: "Feet",
  DataUnit_Stage_m: "Meters",
  DataUnit_Elev_ft: "Feet",
  DataUnit_Elev_m: "Meters",
  DataUnit_SWE_in: "Inches",
  DataUnit_SWE_mm: "Millimeters",
  DataUnit_Temp_F: "Fahrenheit",
  DataUnit_Temp_C: "Celsius",
  DataUnit_Wind_mph: "Miles per Hour",
  DataUnit_Wind_kph: "Kilometers per Hour",
  DataUnit_Wind_mps: "Meters per Second",

  // --------------------------------------
  // DataUnitTypeComboBox
  // --------------------------------------
  DataUnitType_Placeholder: "Select Unit Type",
  DataUnitType_PerAver: "PER-AVER",
  DataUnitType_PerCum: "PER-CUM",
  DataUnitType_InstVal: "INST-VAL",
  DataUnitType_InstCum: "INST-CUM",

  // --------------------------------------
  // FormatSelector
  // --------------------------------------
  FormatSelector_Label: "Data Format:",
  FormatSelector_DSS: "DSS",
  FormatSelector_JSON: "JSON",

  // --------------------------------------
  // PairedCurveTypeComboBox
  // --------------------------------------
  PairedCurveType_Placeholder: "Select Curve Type",
  PairedCurveType_ElevStor: "Elevation - Storage",
  PairedCurveType_StageDisch: "Stage - Discharge",
  PairedCurveType_FreqFlow: "Frequency - Flow",

  // --------------------------------------
  // ParameterComboBox
  // --------------------------------------
  Parameter_Placeholder: "Select Parameter",
  Parameter_Flow: "Flow",
  Parameter_Stage: "Stage",
  Parameter_Elev: "Elevation",
  Parameter_Precipitation: "Precipitation",
  Parameter_SWE: "Snow Water Equivalent (SWE)",
  Parameter_Temperature: "Temperature",
  Parameter_Windspeed: "Windspeed",

  // --------------------------------------
  // TimeSeriesComboBox
  // --------------------------------------
  TimeSeriesCombo_None: "None",

  // --------------------------------------
  // SaveAsDialog
  // --------------------------------------
  SaveAsDialog_Title: "Save {0} As",
  SaveAsDialog_OldName: "Old Name",
  SaveAsDialog_Name: "Name",
  SaveAsDialog_Description: "Description",
  SaveAsDialog_ButtonCancel: "Cancel",
  SaveAsDialog_ButtonOk: "OK",

  // --------------------------------------
  // TableFillOptionsDialog
  // --------------------------------------
  TableContext_Cut: "Cut",
  TableContext_Copy: "Copy",
  TableContext_Paste: "Paste",
  TableContext_Clear: "Clear",
  TableContext_Insert: "Insert",
  TableContext_Fill: "Fill...",
  TableContext_SelectAll: "Select All",
  TableContext_DeleteRows: "Delete Row(s)",

  // --------------------------------------
  // UsgsStationIdsByStateDialog
  // --------------------------------------
  UsgsStationIdsByStateDialog_Title: "Get USGS Station IDs by State",
  UsgsStationIdsByStateDialog_DataType: "Data Type: ",
  UsgsStationIdsByStateDialog_State: "State",
  UsgsStationIdsByStateDialog_State_Placeholder: "Choose a state",

  // --------------------------------------
  // TableFillOptionsDialog
  // --------------------------------------
  TableFillOptions_Title: "Table Fill Options",
  TableFillOptions_Linear: "Linear Fill",
  TableFillOptions_Repeat: "Repeat Fill",
  TableFillOptions_RepeatToEnd: "Repeat to End",
  TableFillOptions_AddConstant: "Add Constant",
  TableFillOptions_MultiplyConstant: "Multiply Constant",
  TableFillOptions_Constant: "Constant",
  TableFillOptions_Cancel_Button: "Cancel",
  TableFillOptions_OK_Button: "OK",

  // --------------------------------------
  // StructureSelector
  // --------------------------------------
  StructureSelector_Label: "Data Structure:",
  StructureSelector_TimeSeries: "Time Series",
  StructureSelector_PairedData: "Paired Data",

  // --------------------------------------
  // ManualDataEntryEditor
  // --------------------------------------
  ManualDataEntryEditor_Legend: "Create New Data Set",
  ManualDataEntryEditor_Name: "Name: ",
  ManualDataEntryEditor_Description: "Description: ",
  ManualDataEntryEditor_CurveType: "Curve Type",
  ManualDataEntryEditor_YLabel: "Y Label",
  ManualDataEntryEditor_YUnits: "Y Units",
  ManualDataEntryEditor_XLabel: "X Label",
  ManualDataEntryEditor_XUnits: "X Units",
  ManualDataEntryEditor_PairedDataTable_Ordinate: "Ordinate",
  ManualDataEntryEditor_PairedDataTable_Units: "Units",
  ManualDataEntryEditor_PairedDataTable_Type: "Type",
  ManualDataEntryEditor_TimeseriesPathname_A: "A",
  ManualDataEntryEditor_TimeseriesPathname_B: "B",
  ManualDataEntryEditor_TimeseriesPathname_C: "C",
  ManualDataEntryEditor_TimeseriesPathname_D: "D",
  ManualDataEntryEditor_TimeseriesPathname_E: "E",
  ManualDataEntryEditor_TimeseriesPathname_F: "F",
  ManualDataEntryEditor_Pathname: "Pathname",
  ManualDataEntryEditor_StartDate: "Start Date",
  ManualDataEntryEditor_StartTime: "Start Time",
  ManualDataEntryEditor_EndDate: "End Date",
  ManualDataEntryEditor_EndTime: "End Time",
  ManualDataEntryEditor_SelectParameter: "Select Parameter",
  ManualDataEntryEditor_Interval: "Interval ",
  ManualDataEntryEditor_Units: "Units",
  ManualDataEntryEditor_Type: "Type",
  ManualDataEntryEditor_DateTimeAutoFilled: "Date/times auto-filled from interval and range. Enter or paste values for each date/time.",
  ManualDataEntryEditor_ClearValues_Button: "Clear Values",
  ManualDataEntryEditor_AddConstant_Button: "Add Constant",
  ManualDataEntryEditor_MultiplyConstant_Button: "Multiply Constant",
  ManualDataEntryEditor_DateTime: "Date/Times",
  ManualDataEntryEditor_Value: "Value",
  ManualDataEntryEditor_DateTimeManual: "Enter date/time and values manually.",
  ManualDataEntryEditor_SummaryStructureType: "Structure Type: ",
  ManualDataEntryEditor_SummaryDataFormat: "Data Format: ",
  ManualDataEntryEditor_SummaryDateTime: "Date/Time",
  ManualDataEntryEditor_SummaryValue: "Value",
  ManualDataEntryEditor_SummaryFilepath: "Filepath: ",
  ManualDataEntryEditor_SummaryPathname: "Pathname: ",
  ManualDataEntryEditor_SummaryCurveType: "Curve Type: ",
  ManualDataEntryEditor_SummaryYUnits: "Y Units: ",
  ManualDataEntryEditor_SummaryXLabel: "X Label: ",
  ManualDataEntryEditor_SummaryXUnits: "X Units: ",

  // --------------------------------------
  // USGS Data Importer
  // --------------------------------------
  UsgsDataImporter_Name: "Name: ",
  UsgsDataImporter_Description: "Description: ",
  UsgsDataImporter_SummaryDataFormat: "Data Format: ",
  UsgsDataImporter_DataType_Label: "Data Type: ",
  UsgsDataImporter_DataType_AnnualPeakData: "Annual Peak Data",
  UsgsDataImporter_DataType_Daily: "Daily",
  UsgsDataImporter_DataType_Instantaneous: "Instantaneous",
  UsgsDataImporter_DateRange_Label: "Date Range: ",
  UsgsDataImporter_StartDate: "Start Date",
  UsgsDataImporter_EndDate: "End Date",
  UsgsDataImporter_RetrievePor: "Retrieve Period of Record",
  UsgsDataImporter_TimeZone_Label: "Time Zone: ",
  UsgsDataImporter_TimeZone_UTC: "UTC",
  UsgsDataImporter_TimeZone_LocalStandard: "Local Standard Time",
  UsgsDataImporter_Variety_Label: "Variety: ",
  UsgsDataImporter_Variety_Flow: "Flow",
  UsgsDataImporter_Variety_Stage: "Stage",
  UsgsDataImporter_StationID_Label: "Station IDs: ",
  UsgsDataImporter_StationID_Manual: "Enter station IDs manually",
  UsgsDataImporter_StationID_Auto: "Get USGS Station IDs by State",
  UsgsDataImporter_GetStations_Button: "Get Station IDs",
  UsgsDataImporter_Import_SelectStations_Label: "Select which stations to import and adjust the DSS pathname parts.",
  UsgsDataImporter_Import_StationsToImport_Label: "Stations to import",
  UsgsDataImporter_Import_StatesRetrieved_Label: "States retrieved:",
  UsgsDataImporter_Import_Select_Button: "Select all",
  UsgsDataImporter_Import_Unselect_Button: "Unselect all",
  UsgsDataImporter_Import_AddStationRow_Button: "Add station row",
  UsgsDataImporter_Import_Button: "Import",
  UsgsDataImporter_Importing_Button: "Importing...",
  UsgsDataImporter_Import_Title: "Importing USGS Data",
  UsgsDataImporter_Import_Close_Button: "Close",
  UsgsDataImporter_Import_Progress_QueryingStarting: "Querying USGS data...",
  UsgsDataImporter_Import_Progress_DownloadingStarting: "Downloading USGS data...",
  UsgsDataImporter_Import_Progress_QueryingRange: "Querying {0}–{1} of {2}...",
  UsgsDataImporter_Import_Write_Preparing: "Preparing to write...",
  UsgsDataImporter_Import_Write_Done: "Finished writing data to disk.",
  UsgsDataImporter_Import_Progress_Downloading: "Downloading {0} of {1}...",
  UsgsDataImporter_Import_Write_Flow_DSS: "Writing flow to DSS...",
  UsgsDataImporter_Import_Write_Stage_DSS: "Writing stage to DSS...",
  UsgsDataImporter_Import_Write_Flow_JSON: "Writing flow to JSON...",
  UsgsDataImporter_Import_Write_Stage_JSON: "Writing stage to JSON...",
  UsgsDataImporter_Import_ProgressDialog_TotalSeries: "Total series requested: ",
  UsgsDataImporter_Import_Write_Dss_Flow: "Writing flow to DSS...",
  UsgsDataImporter_Import_Write_Dss_Stage: "Writing stage to DSS...",
  UsgsDataImporter_Import_Write_Json_Flow: "Writing flow to JSON...",
  UsgsDataImporter_Import_Write_Json_Stage: "Writing stage to JSON...",
  UsgsDataImporter_Import_Summary_TotalSelected: "Total selected stations: ",
  UsgsDataImporter_Import_Summary_TotalSeries: "Total series requested: ",
  UsgsDataImporter_Import_Summary_WithData: "Stations with data: ",
  UsgsDataImporter_Import_Summary_WithoutData: "Stations with no data: ",
  UsgsDataImporter_Import_Summary_Failed: "Stations failed: ",

  // --------------------------------------
  // Wizard Navigation Buttons
  // --------------------------------------
  WIZARD_CANCEL: "X Cancel",
  WIZARD_BACK: "< Back",
  WIZARD_NEXT: "Next >",
  WIZARD_FINISH: "Finish",

  // --------------------------------------
  // Dialog Buttons
  // --------------------------------------
  SAVE: "Save",
  CANCEL: "Cancel",
  DELETE: "Delete",

  // --------------------------------------
  // Popout
  // --------------------------------------
  PLOT_L: "Plot",
  WAITING_L: "Waiting for plot…",
  REFRESH_B: "Refresh",
  CLOSE_B: "Close",

  // --------------------------------------
  // Analysis Wizard - General Information
  // --------------------------------------
  Wizard_GeneralInfo: "General Information",
  Wizard_Name: "Name",
  Wizard_Description: "Description",
  Wizard_Dataset: "Dataset",
  Wizard_Summary_Title: "Review your inputs before proceeding.",
  Wizard_Summary_None: "(None)",
  Wizard_Summary_Name: "Name: ",
  Wizard_Summary_Description: "Description: ",
  Wizard_Summary_Dataset: "Time series: ",

  // --------------------------------------
  // Analysis Wizard - Skew
  // --------------------------------------
  AnalysisWizard_Skew_StepSkew: "Skew",
  AnalysisWizard_Skew_UseStationSkew: "Use Station Skew",
  AnalysisWizard_Skew_UseWeightedSkew: "Use Weighted Skew",
  AnalysisWizard_Skew_UseRegionalSkew: "Use Regional Skew",
  AnalysisWizard_Skew_RegionalSkew: "Regional Skew",
  AnalysisWizard_Skew_RegionalSkewMSE: "Regional Skew MSE",
  AnalysisWizard_Skew_Summary_SkewSelection: "Skew Selection:",
  AnalysisWizard_Skew_Summary_SkewType: "Type:",
  AnalysisWizard_Skew_Summary_UseStationSkew: "Use Station Skew:",
  AnalysisWizard_Skew_Summary_UseWeightedSkew: "Use Weighted Skew:",
  AnalysisWizard_Skew_Summary_UseRegionalSkew: "Use Regional Skew:",
  AnalysisWizard_Skew_Summary_RegionalSkew: "Regional Skew:",
  AnalysisWizard_Skew_Summary_RegionalSkewMSE: "Regional Skew MSE:",
  AnalysisWizard_Skew_Summary_SkewType_None: "(None selected)",

  // --------------------------------------
  // Bulletin17Wizard
  // --------------------------------------
  Bulletin17_Wizard_TimeWindow_Label: "Time Window",
  Bulletin17_Wizard_TimeWindow_Description: "Define the absolute time window for EMA Analysis.",
  Bulletin17_Wizard_TimeWindow_StartYear: "Start Year",
  Bulletin17_Wizard_TimeWindow_EndYear: "End Year",
  Bulletin17_Wizard_FlowRanges_Label: "Flow Ranges",
  Bulletin17_Wizard_FlowRanges_Description: "Enter annual peak values and optional low/high ranges. Years are generated from the time window.",
  Bulletin17_Wizard_Thresholds_Add: "Add",
  Bulletin17_Wizard_Thresholds_Remove: "Remove",
  Bulletin17_Wizard_Thresholds_Col_StartYear: "Start Year",
  Bulletin17_Wizard_Thresholds_Col_EndYear: "End Year",
  Bulletin17_Wizard_Thresholds_Col_Low: "Low Threshold",
  Bulletin17_Wizard_Thresholds_Col_High: "High Threshold",
  Bulletin17_Wizard_Thresholds_Col_Comments: "Comments",
  Bulletin17_Wizard_FlowRanges_Col_Year: "Year",
  Bulletin17_Wizard_FlowRanges_Col_Peak: "Peak",
  Bulletin17_Wizard_FlowRanges_Col_Low: "Low Value",
  Bulletin17_Wizard_FlowRanges_Col_High: "High Value",
  Bulletin17_Wizard_FlowRanges_Col_DataType: "Data Type",
  Bulletin17_Wizard_FlowRanges_RefreshPlot: "Refresh Plot",
  Bulletin17_Wizard_FlowRanges_ApplyThresholds: "Apply",
  Bulletin17_Wizard_FlowRanges_XLabel: "Year",
  Bulletin17_Wizard_FlowRanges_YLabel: "Flow",
  Bulletin17_Wizard_FlowRanges_Legend_Data: "Data",
  Bulletin17_Wizard_FlowRanges_Legend_Ranges: "Flow Ranges",
  Bulletin17_Wizard_Prob_Label: "Probability",
  Bulletin17_Wizard_Prob_Field: "Frequency in Percent",
  Bulletin17_Wizard_Step_Summary: "Complete",

  // --------------------------------------
  // CopulaWizard
  // --------------------------------------
  Copula_Wizard_StepScenarios: "Scenarios",
  Copula_Wizard_StepScenarios_Label: "Enter names for bivariate scenarios and select the datasets.",
  Copula_Wizard_StepScenarios_Table_ScenarioName: "Scenario Name",
  Copula_Wizard_StepScenarios_Table_CondVarDataset: "Conditioning Variable Dataset",
  Copula_Wizard_StepScenarios_Table_NonCondVarDataset: "Non-Conditioned Variable Dataset",
  Copula_Wizard_StepMarginalDist: "Marginal Distributions",
  Copula_Wizard_StepMarginalDist_Label: "Select marginal distributions for each variable.",
  Copula_Wizard_StepMarginalDist_Scenario_L: "Scenario: ",
  Copula_Wizard_StepMarginalDist_Scenario: "Scenario ",
  Copula_Wizard_StepMarginalDist_CondVarDataset_L: "Conditioning Variable Dataset: ",
  Copula_Wizard_StepMarginalDist_NonCondVarDataset_L: "Non-conditioning Variable Dataset: ",
  Copula_Wizard_StepMarginalDist_CondVarDist_L: "Conditioning Variable Distribution:",
  Copula_Wizard_StepMarginalDist_NonCondVarDist_L: "Non-conditioning Variable Distribution:",
  Copula_Wizard_StepMarginalDist_LPIII: "Log Pearson III",
  Copula_Wizard_StepMarginalDist_GEV: "Generalized Extreme Value (GEV)",
  Copula_Wizard_StepMarginalDist_LOGN: "Log Normal",
  Copula_Wizard_StepMarginalDist_LOGN10: "Log10 Normal",
  Copula_Wizard_StepMarginalDist_Normal: "Normal",
  Copula_Wizard_StepMarginalDist_GenPar: "Generalized Pareto",
  Copula_Wizard_StepMarginalDist_Emp: "Empirical",
  Copula_Wizard_StepMarginalDist_Location_L: "Location (\u03BE):",
  Copula_Wizard_StepMarginalDist_Scale_L: "Scale (\u03B1):",
  Copula_Wizard_StepMarginalDist_Shape_L: "Shape (\u03BA):",
  Copula_Wizard_StepMarginalDist_Mean_L: "Mean:",
  Copula_Wizard_StepMarginalDist_StdDev_L: "Standard Deviation:",
  Copula_Wizard_StepMarginalDist_Skew_L: "Skew:",

  Copula_Wizard_StepContProb: "Contour Probabilities",
  Copula_Wizard_StepContProb_Label: "Enter or edit the contour probabilities in the table.",
  Copula_Wizard_StepContProb_DispCumulativeProb: "Display as cumulative probabilities.",
  Copula_Wizard_StepContProb_HeaderAEP: "Annual Exceedance Probabilities",
  Copula_Wizard_StepContProb_HeaderCum: "Cumulative Probabilities",
  Copula_Wizard_StepCopulaSelection: "Copula Selection",
  Copula_Wizard_StepDesignEvents: "Design Events",
  Copula_Wizard_StepCondSims: "Conditional Simulations",
  Copula_Wizard_Step_Summary: "Complete",


  // --------------------------------------
  // FloodTypeClassWizard
  // --------------------------------------
  FloodTypeClass_Wizard_StepFlowData: "Flow Data Source",
  FloodTypeClass_Wizard_StepFlowData_Label:
      "Select a flow data source and enter the time window over which to classify events.",
  FloodTypeClass_Wizard_StepFlowData_TimeSeries: "Select time series:",
  FloodTypeClass_Wizard_StepFlowData_StartDate: "Classification Start Date:",
  FloodTypeClass_Wizard_StepFlowData_StartTime: "Classification Start Time:",
  FloodTypeClass_Wizard_StepFlowData_EndDate: "Classification End Date:",
  FloodTypeClass_Wizard_StepFlowData_EndTime: "Classification End Time:",
  FloodTypeClass_Wizard_StepFloodTypeClass: "Flood Type Classification",
  FloodTypeClass_Wizard_StepFloodTypeClass_Label: "Select a flood type classification algorithm.",
  FloodTypeClass_Wizard_StepFloodTypeClass_HumidEastDelawareRiver: "Humid East | Delaware River",
  FloodTypeClass_Wizard_StepFloodTypeClass_HumidEastTrinityRiver: "Humid East | Trinity River",
  FloodTypeClass_Wizard_StepFloodTypeClass_MountainousWestPugetSound: "Mountainous West | Puget Sound",
  FloodTypeClass_Wizard_StepFloodTypeClass_MountainousWestUpperColoradoRiver:
      "Mountainous West | Upper Colorado River",
  FloodTypeClass_Wizard_StepFloodTypeClass_CentralPlainsRedRiver: "Central Plains | Red River of the North",
  FloodTypeClass_Wizard_StepFloodTypeClass_CentralPlainsIowaRiver: "Central Plains | Iowa River",
  FloodTypeClass_Wizard_StepDataSources: "Data Sources",
  FloodTypeClass_Wizard_StepDataSources_Label: "Select data sources for flood type indicators.",
  FloodTypeClass_Wizard_StepDataSources_PrecipTS: "Precipitation time series:",
  FloodTypeClass_Wizard_StepDataSources_SweTS: "SWE time series:",
  FloodTypeClass_Wizard_StepLookback: "Lookback Period",
  FloodTypeClass_Wizard_StepLookback_Label: "Specify lookback period for each flood type indicator.",
  FloodTypeClass_Wizard_StepLookback_Lookback_UserSpecified: "User-specified",
  FloodTypeClass_Wizard_StepLookback_Lookback_Days: "Days",
  FloodTypeClass_Wizard_StepLookback_Lookback_Ceiling: "ceiling[5 + ln(DA)]",
  FloodTypeClass_Wizard_StepLookback_Lookback_DrainageArea: "Drainage area (sq. mi.)",
  FloodTypeClass_Wizard_StepLookback_Flow_Label: "Flow lookback period (days)",
  FloodTypeClass_Wizard_StepLookback_SWELabel: "SWE depletion lookback period (days):",
  FloodTypeClass_Wizard_StepLookback_PrecipLabel: "Precipitation lookback period (days):",
  FloodTypeClass_Wizard_StepThresholds: "Thresholds",
  FloodTypeClass_Wizard_StepThresholds_Label:
      "Enter critical threshold values for each indicator. The default values used in the flood type algorithm are entered for you.",
  FloodTypeClass_Wizard_StepThresholds_Precip: "Critical threshold for precipitation accumulation (in):",
  FloodTypeClass_Wizard_StepThresholds_SWE: "Critical threshold for SWE depletion (in):",
  FloodTypeClass_Wizard_StepThresholds_SnowmeltFrac: "Critical snowmelt fraction:",
  FloodTypeClass_Wizard_StepThresholds_RainFrac: "Critical rain fraction:",
  FloodTypeClass_Wizard_StepReview: "Review Inputs",
  FloodTypeClass_Wizard_StepResults: "Results",
  FloodTypeClass_Wizard_Review_Timeseries: "Time series:",
  FloodTypeClass_Results_Placeholder: "Results go here",

  // --------------------------------------
  // PeakFlowFreqWizard
  // --------------------------------------
  Wizard_DescriptionPlaceholder: "Optional",
  PeakFlowFreqWizard_DoNotCompExpProb: "Do not Compute Expected Probability",
  PeakFlowFreqWizard_CompExpProb: "Compute Expected Probability Curve using Numerical Integration (EMA)",
  PeakFlowFreqWizard_EditOutputFreqOrd: "Edit the output frequency ordinates in the table below.",
  PeakFlowFreqWizard_FreqInPercent: "Frequency in Percent",
  PeakFlowFreqWizard_SummaryExpectedProbability: "Expected Probability",
  PeakFlowFreqWizard_SummaryComputation: "Computation:",
  PeakFlowFreqWizard_SummaryComputation_None: "(None selected)",
  PeakFlowFreqWizard_SummaryFrequencies: "Frequencies",
  PeakFlowFreqWizard_SummaryFrequencies_None: "(No values entered)",
  PeakFlowFreqWizard_StepExpProb: "Expected Probability",
  PeakFlowFreqWizard_StepOutFreqOrd: "Output Frequency Ordinates",
  PeakFlowFreqWizard_StepComplete: "Complete",

  // --------------------------------------
  // ----TreeNode
  // --------------------------------------
  Tree_NoAnalyses: "(No analyses)",
  Tree_Alt_DataIcon: "Data",
  Tree_Menu_SaveAs: "Save As",
  Tree_Menu_Rename: "Rename",
  Tree_Menu_Delete: "Delete",
  Tree_Menu_Plot: "Plot",
  Tree_Badge_B17: "B17",
  Tree_Badge_FTC: "FTC",
  Tree_Badge_PFF: "PFF",

  // --------------------------------------
  // ----Maps
  // --------------------------------------
  ComponentRegistry_ComponentMap: "Map",

  // --------------------------------------
  // PairedDataPlot
  // --------------------------------------
  PairedDataPlot_DefaultXLabel: "X",
  PairedDataPlot_DefaultYLabel: "Y",
  PairedDataPlot_DefaultTitle: "Paired Data Plot",
  PairedDataPlot_InvalidData: "Error: Invalid DSS Paired Data.",

  // --------------------------------------
  // TimeSeriesPlot
  // --------------------------------------
  TimeSeriesPlot_DefaultYLabel: "Value",
  TimeSeriesPlot_XLabelTime: "Time",
  TimeSeriesPlot_InvalidData: "Error: Invalid DSS TimeSeries data.",
} as const;

export type InterfaceKey = keyof typeof INTERFACE_TEXT;

/** Replace {0}, {1}, ... with provided args */
export function getInterfaceText(key: InterfaceKey | string, args: unknown[] = []): string {
  const raw = (INTERFACE_TEXT as Record<string, string>)[key] ?? key;
  const arr = Array.isArray(args) ? args : (args == null ? [] : [args]);

  let out = raw;
  arr.forEach((arg, i) => {
    out = out.replace(new RegExp(`\\{${i}\\}`, "g"), String(arg ?? ""));
  });
  return out;
}
