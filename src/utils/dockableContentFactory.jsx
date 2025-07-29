import React from "react";
import ComponentMap from "../app_components/ComponentMap";
import ComponentMessage from "../app_components/ComponentMessage";
import ComponentContent from "../app_components/ComponentContent";
import ComponentStyleSelector from "../app_components/ComponentStyleSelector";
import PairedDataPlot from "../app_components/PairedDataPlot";
import TimeSeriesPlot from "../app_components/TimeSeriesPlot";

import ManualDataEntryEditor from "../app_components/data/ManualDataEntryEditor/ManualDataEntryEditor";

import PeakFlowFreqWizard from "../app_components/analysis/PeakFlowFreqWizard";
import Bulletin17AnalysisWizard from "../app_components/analysis/Bulletin17AnalysisWizard";
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

export const dockableContentFactory = (type, props = {}) => {
  switch (type) {
    case "ComponentContent":
      return <ComponentContent
        maps={props.maps}
        data={props.data}
        analyses={props.analyses}
        onSaveAsNode={props.onSaveAsNode}
        onRenameNode={props.onRenameNode}
        onDeleteNode={props.onDeleteNode}
        handleOpenComponent={props.handleOpenComponent}
      />;
    case "ComponentMap":
      return <ComponentMap/>;
    case "ComponentMessage":
      return <ComponentMessage {...props} />;
    case "ComponentStyleSelector":
      return <ComponentStyleSelector/>;
    case "TimeSeriesPlot":
      return <TimeSeriesPlot {...props} dataset={props.dataset}/>;
    case "PairedDataPlot":
      return (
        <PairedDataPlot
          {...props}
          dataset={props.dataset}
        />
      );

    case "ManualDataEntryEditor":
      return <ManualDataEntryEditor {...props} onDataSave={props.onDataSave}/>;

    // Analysis
    case "PeakFlowFreqWizard":
      return <PeakFlowFreqWizard {...props} analyses={props.analyses} data={props.data}/>;
    case "Bulletin17AnalysisWizard":
      return <Bulletin17AnalysisWizard {...props} />;
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
    default:
      return <div>Unknown Component</div>;
  }
};
