import React from "react";

// Panels
import ComponentInterfaceOptions from "../app_components/ComponentInterfaceOptions";
import ComponentMap from "../app_components/ComponentMap";
import ComponentMessage from "../app_components/ComponentMessage";
import ComponentPlotStyle from "../app_components/ComponentPlotStyle"; // ⬅️ no named imports
import ComponentProject from "../app_components/ComponentProject";
import PairedDataPlot from "../app_components/plots/PairedDataPlot";
import TimeSeriesPlot from "../app_components/plots/TimeSeriesPlot";
import DemoPlots from "../app_components/plots/DemoPlots";

// Editors
import ManualDataEntryEditor from "../app_components/data/ManualDataEntryEditor/ManualDataEntryEditor";

// Analysis wizards
import Bulletin17AnalysisWizard from "../app_components/analysis/bulletin17/Bulletin17AnalysisWizard";
import CopulaAnalysisWizard from "../app_components/analysis/copula/CopulaAnalysisWizard";
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

/** ---------- Types that match ComponentProject’s object-style API ---------- */
export type Section = "maps" | "data" | "analyses";

export type SaveAsArgs =
    | { section: "maps"; pathArr: [number]; newName: string; newDesc?: string; item?: any }
    | { section: "data"; pathArr: [string, number]; newName: string; newDesc?: string; item?: any }
    | { section: "analyses"; pathArr: [string, number]; newName: string; newDesc?: string; item?: any };

export type RenameArgs =
    | { section: "maps"; pathArr: [number]; newName: string }
    | { section: "data"; pathArr: [string, number]; newName: string }
    | { section: "analyses"; pathArr: [string, number]; newName: string };

export type DeleteArgs =
    | { section: "maps"; pathArr: [number] }
    | { section: "data"; pathArr: [string, number] }
    | { section: "analyses"; pathArr: [string, number] };

/** ---------- Legacy positional shapes (what some callers may still use) ---------- */
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
  onSaveAsNode?: SaveAsPositional | ((args: SaveAsArgs) => void | Promise<void>);
  onRenameNode?: RenamePositional | ((args: RenameArgs) => void | Promise<void>);
  onDeleteNode?:
      | DeletePositional
      | ((args: DeleteArgs & { name?: string }) => void | Promise<void>);

  // actions
  onRemove?: () => void;
  onDataSave?: (category: string, valuesObj: any) => Promise<void>;
  onWizardFinish?: (type: string, valuesObj: any, id?: string) => Promise<void>;
  handleOpenComponent?: (type: string, props?: any) => void;

  // allow any extra props to flow through safely
  [key: string]: any;
}

/** ---------- Adapters: always present object-style handlers to ComponentProject ---------- */
function toObjectSaveAs(
    fn?: DockableFactoryProps["onSaveAsNode"]
): ((args: SaveAsArgs) => void | Promise<void>) | undefined {
  if (!fn) return undefined;
  // If the function’s declared parameters suggest positional, wrap it
  if ((fn as SaveAsPositional).length >= 3) {
    const pos = fn as SaveAsPositional;
    return (args: SaveAsArgs) =>
        pos(args.section, args.pathArr, args.newName, (args as any).newDesc, (args as any).item);
  }
  return fn as (args: SaveAsArgs) => void | Promise<void>;
}

function toObjectRename(
    fn?: DockableFactoryProps["onRenameNode"]
): ((args: RenameArgs) => void | Promise<void>) | undefined {
  if (!fn) return undefined;
  if ((fn as RenamePositional).length >= 3) {
    const pos = fn as RenamePositional;
    return (args: RenameArgs) => pos(args.section, args.pathArr, args.newName);
  }
  return fn as (args: RenameArgs) => void | Promise<void>;
}

function toObjectDelete(
    fn?: DockableFactoryProps["onDeleteNode"]
): ((args: DeleteArgs & { name?: string }) => void | Promise<void>) | undefined {
  if (!fn) return undefined;
  if ((fn as DeletePositional).length >= 2) {
    const pos = fn as DeletePositional;
    return (args: DeleteArgs & { name?: string }) =>
        pos(args.section, args.pathArr, (args as any).name);
  }
  return fn as (args: DeleteArgs & { name?: string }) => void | Promise<void>;
}
/** ---------- Factory ---------- */
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
              onSaveAsNode={toObjectSaveAs(props.onSaveAsNode)}
              onRenameNode={toObjectRename(props.onRenameNode)}
              onDeleteNode={
                // ComponentProject now expects object-style DeleteArgs
                toObjectDelete(props.onDeleteNode)
                    ? (args) => toObjectDelete(props.onDeleteNode)!(args)
                    : undefined
              }
              handleOpenComponent={props.handleOpenComponent}
          />
      );

    case "ComponentInterfaceOptions":
      return <ComponentInterfaceOptions />;

    case "ComponentMap":
      return <ComponentMap />;

    case "ComponentMessage":
      return (
          <ComponentMessage
              messages={props.messages ?? []}
              onRemove={props.onRemove ?? (() => {})}
          />
      );

    case "ComponentPlotStyle":
      return <ComponentPlotStyle />;

    case "TimeSeriesPlot":
      return <TimeSeriesPlot dataset={props.dataset} />;

    case "PairedDataPlot":
      return <PairedDataPlot dataset={props.dataset} />;

    case "DemoPlots":
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

    case "CopulaAnalysisWizard":
      return <CopulaAnalysisWizard {...props} />;

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

      /** ---------- UNKNOWN ---------- */
    default:
      return <div>Unknown Component</div>;
  }
};
