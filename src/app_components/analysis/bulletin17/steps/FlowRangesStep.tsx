import React from "react";
import { Button, Group, ScrollArea } from "@mantine/core";
import { TextStore } from "../../../../utils/TextStore";
import type { WizardStep } from "../../_shared/WizardRunner";
import { clampInt } from "./flowRangesUtils";
import type { FlowRangesBag } from "./useFlowRangesStep";
import { useFlowRangesStep } from "./useFlowRangesStep";
import { PerceptionThresholdsTable } from "./PerceptionThresholdsTable";
import { FlowRangesTable } from "./FlowRangesTable";
import { FlowRangesPlot } from "./FlowRangesPlot";

type Props<B extends FlowRangesBag> = {
  bag: B;
  setBag: (fn: (prev: B) => B) => void;
  selectedDataset?: string;
  data: Record<string, unknown>;
};

function FlowRangesStepBody<B extends FlowRangesBag>({
                                                       bag,
                                                       setBag,
                                                       selectedDataset,
                                                       data,
                                                     }: Props<B>) {
  const step = useFlowRangesStep({ bag, setBag, selectedDataset, data });

  return (
    <div ref={step.rootRef} className="flowranges-root">
      <div className="flowranges-left">
        <div className="flowranges-thresholds-block">
          <PerceptionThresholdsTable
            totalStartYear={step.totalStartYear}
            totalEndYear={step.totalEndYear}
            totalLow={step.totalLow}
            setTotalLow={step.setTotalLow}
            totalHigh={step.totalHigh}
            setTotalHigh={step.setTotalHigh}
            totalComment={step.totalComment}
            setTotalComment={step.setTotalComment}
            newThrStartYear={step.newThrStartYear}
            setNewThrStartYear={step.setNewThrStartYear}
            newThrEndYear={step.newThrEndYear}
            setNewThrEndYear={step.setNewThrEndYear}
            addThreshold={step.addThreshold}
            thresholdRows={step.thresholdRows}
            thrShades={step.thrShades}
            setThresholdCell={step.setThresholdCell}
            removeThreshold={step.removeThreshold}
            clampInt={clampInt}
            tableStyles={step.tableStyles}
            greenCell={step.greenCell}
            textInputStyles={step.textInputStyles}
            numberInputStyles={step.numberInputStyles}
          />
        </div>

        <Group justify="flex-end" className="flowranges-actions">
          <Button size="xs" onClick={step.applyThresholdsToFlowRanges}>
            {TextStore.interface("Bulletin17_Wizard_FlowRanges_ApplyThresholds")}
          </Button>
        </Group>

        <div className="flowranges-table-wrap">
          <ScrollArea className="scroll-area" type="auto">
            <FlowRangesTable
              rows={step.rows}
              DATA_TYPES={step.DATA_TYPES}
              setCell={step.setCell}
              applyPasteGrid={step.applyPasteGrid}
              tableStyles={step.tableStyles}
            />
          </ScrollArea>
        </div>
      </div>

      <div className="flowranges-right">
        <FlowRangesPlot
          plotKey={step.plotKey}
          refreshPlot={step.refreshPlot}
          plotData={step.plotData}
          layout={step.layout}
        />
      </div>
    </div>
  );
}

export default function makeFlowRangesStep(): WizardStep {
  return {
    label: TextStore.interface("Bulletin17_Wizard_FlowRanges_Label"),
    render: ({ bag, setBag, selectedDataset, data }: any) => (
      <FlowRangesStepBody bag={bag} setBag={setBag} selectedDataset={selectedDataset} data={data} />
    ),
  };
}
