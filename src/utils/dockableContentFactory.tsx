import React from "react";

// Panels
import ComponentInterfaceOptions from "../app_components/ComponentInterfaceOptions";
import ComponentMap from "../app_components/ComponentMap";
import ComponentMessage from "../app_components/ComponentMessage";
import ComponentProject from "../app_components/ComponentProject";
import PairedDataPlot from "../app_components/PairedDataPlot";
import TimeSeriesPlot from "../app_components/TimeSeriesPlot";
import DemoPlots from "../app_components/DemoPlots";

// Editors
import ManualDataEntryEditor from "../app_components/data/ManualDataEntryEditor/ManualDataEntryEditor";

// Analysis wizards
import Bulletin17AnalysisWizard from "../app_components/analysis/bulletin17/Bulletin17AnalysisWizard";
import FloodTypeClassAnalysisWizard from "../app_components/analysis/flood_type_classification/FloodTypeClassAnalysisWizard";
import PeakFlowFreqWizard from "../app_components/analysis/peak_flow/PeakFlowFreqWizard";
import GeneralFreqAnalysisWizard from "../app_components/analysis/GeneralFreqAnalysisWizard";
import VolumeFreqAnalysisWizard from "../app_components/analysis/VolumeFreqAnalysisWizard";
import CoincidentFreqAnalysisWizard from "../app_components/analysis/CoincidentFreqAnalysisWizard";
import CurveCombinationAnalysisWizard from "../app_components/analysis/CurveCombinationAnalysisWizard";
import BalancedHydrographAnalysisWizard from "../app_components/analysis/BalancedHydrographAnalysisWizard";
import DistributionFittingAnalysisWizard from "../app_components/analysis/DistributionFittingAnalysisWizard";
import MixedPopulationAnalysisWizard from "../app_components/analysis/MixedPopulationAnalysisWizard";
import CorrelationAnalysisWizard from "../app_components/analysis/CorrelationAnalysisWizard";
import RecordExtensionAnalysisWizard from "../app_components/analysis/RecordExtensionAnalysisWizard";
import PeaksOverThresholdAnalysisWizard from "../app_components/analysis/PeaksOverThresholdAnalysisWizard";
import LinearRegressionWizard from "../app_components/analysis/LinearRegressionWizard";
import QuantileMappingWizard from "../app_components/analysis/QuantileMappingWizard";
import CopulaAnalysisWizard from "../app_components/analysis/CopulaAnalysisWizard";

/** ---------------- Types to mirror what DockableFrame is passing ---------------- */

type Section = "maps" | "data" | "analyses";

// Legacy positional signatures (ComponentProject expects these)
export type SaveAsPositional = (
    section: Section,
    pathArr: (string | number)[],
    newName: string,
    newDesc?: string,
    item?: any
) => void | Promise<void>;

export type RenamePositional = (
    section: Section,
    pathArr: (string | number)[],
    newName: string
) => void | Promise<void>;

export type DeletePositional = (
    section: Section,
    pathArr: (string | number)[],
    name?: string
) => void | Promise<void>;

/** Props object DockableFrame builds and passes into the factory */
export interface DockableFactoryProps {
  // identity / context
  id?: string;
  type?: string;

  // data
  maps?: any;
  data?: any;
  analyses?: any;

  // dataset for plots
  dataset?: any;

  // messaging
  messages?: any[];

  // tree operations (legacy positional, as used by ComponentProject)
  onSaveAsNode?: SaveAsPositional;
  onRenameNode?: RenamePositional;
  onDeleteNode?: DeletePositional;

  // actions
  onRemove?: () => void;
  onDataSave?: (category: string, valuesObj: any) => Promise<void>;
  onWizardFinish?: (type: string, valuesObj: any, id?: string) => Promise<void>;
  handleOpenComponent?: (type: string, props?: any) => void;

  // allow any extra props to flow through safely
  [key: string]: any;
}

/** ---------------- Factory ---------------- */

export const dockableContentFactory = (
    type: string,
    props: DockableFactoryProps = {}
): React.ReactNode => {
  switch (type) {
      /** ---------- PANELS ---------- */
    case "ComponentProject":
      return (
          <ComponentProject
              maps={props.maps}
              data={props.data}
              analyses={props.analyses}
              onSaveAsNode={props.onSaveAsNode}
              onRenameNode={props.onRenameNode}
              onDeleteNode={props.onDeleteNode}
              handleOpenComponent={props.handleOpenComponent}
          />
      );

    case "ComponentInterfaceOptions":
      return <ComponentInterfaceOptions />;

    case "ComponentMap":
      return <ComponentMap />;

    case "ComponentMessage":
      // Pass only what the component actually expects:
      // { messages?: any[]; onRemove: any }
      return (
          <ComponentMessage
              messages={props.messages}
              onRemove={props.onRemove}
          />
      );

    case "TimeSeriesPlot":
      return <TimeSeriesPlot dataset={props.dataset} />;

    case "PairedDataPlot":
      return <PairedDataPlot dataset={props.dataset} />;

    case "DemoPlots":
      // This component expects no props; don't spread anything.
      return <DemoPlots />;

      /** ---------- EDITORS ---------- */
    case "ManualDataEntryEditor":
      return (
          <ManualDataEntryEditor
              id={props.id}
              onDataSave={props.onDataSave}
              onRemove={props.onRemove}
          />
      );

      /** ---------- ANALYSIS WIZARDS ---------- */
    case "Bulletin17AnalysisWizard":
      return <Bulletin17AnalysisWizard {...props} />;

    case "FloodTypeClassAnalysisWizard":
      return <FloodTypeClassAnalysisWizard {...props} />;

    case "PeakFlowFreqWizard":
      return (
          <PeakFlowFreqWizard
              {...props}
              analyses={props.analyses}
              data={props.data}
              onFinish={props.onWizardFinish}
              onRemove={props.onRemove}
          />
      );

    case "GeneralFreqAnalysisWizard":
      return <GeneralFreqAnalysisWizard {...props} />;

    case "VolumeFreqAnalysisWizard":
      return <VolumeFreqAnalysisWizard {...props} />;

    case "CoincidentFreqAnalysisWizard":
      return <CoincidentFreqAnalysisWizard {...props} />;

    case "CurveCombinationAnalysisWizard":
      return <CurveCombinationAnalysisWizard {...props} />;

    case "BalancedHydrographAnalysisWizard":
      return <BalancedHydrographAnalysisWizard {...props} />;

    case "DistributionFittingAnalysisWizard":
      return <DistributionFittingAnalysisWizard {...props} />;

    case "MixedPopulationAnalysisWizard":
      return <MixedPopulationAnalysisWizard {...props} />;

    case "CorrelationAnalysisWizard":
      return <CorrelationAnalysisWizard {...props} />;

    case "RecordExtensionAnalysisWizard":
      return <RecordExtensionAnalysisWizard {...props} />;

    case "PeaksOverThresholdAnalysisWizard":
      return <PeaksOverThresholdAnalysisWizard {...props} />;

    case "LinearRegressionWizard":
      return <LinearRegressionWizard {...props} />;

    case "QuantileMappingWizard":
      return <QuantileMappingWizard {...props} />;

    case "CopulaAnalysisWizard":
      return <CopulaAnalysisWizard {...props} />;

      /** ---------- UNKNOWN ---------- */
    default:
      return <div>Unknown Component</div>;
  }
};

export default dockableContentFactory;
