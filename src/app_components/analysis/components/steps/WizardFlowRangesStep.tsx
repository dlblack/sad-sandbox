import React, { useEffect } from "react";
import { Button, Group } from "@mantine/core";
import { clampInt } from "../../bulletin17/steps/flowRangesUtils";
import type { FlowRangesBag } from "../../bulletin17/steps/useFlowRangesStep";
import { useFlowRangesStep } from "../../bulletin17/steps/useFlowRangesStep";
import { PerceptionThresholdsTable } from "../../bulletin17/steps/PerceptionThresholdsTable";
import { FlowRangesTable } from "../../bulletin17/steps/FlowRangesTable";
import { FlowRangesPlot } from "../../bulletin17/steps/FlowRangesPlot";
import { TextStore } from "../../../../utils/TextStore";

type Props<B extends FlowRangesBag> = {
  bag: B;
  setBag: (fn: (prev: B) => B) => void;
  selectedDataset?: string;
  data: Record<string, unknown>;
};

export default function WizardFlowRangesStep<B extends FlowRangesBag>({
                                                                        bag,
                                                                        setBag,
                                                                        selectedDataset,
                                                                        data,
                                                                      }: Props<B>) {
  const step = useFlowRangesStep({ bag, setBag, selectedDataset, data });

  /**
   * Attach layout classes to Mantine ScrollArea internals.
   * This replaces inline style mutation.
   */
  useEffect(() => {
    const root = step.rootRef.current;
    if (!root) return;

    const viewport = root.closest(
      ".mantine-ScrollArea-viewport"
    ) as HTMLElement | null;
    if (!viewport) return;

    const inner = viewport.firstElementChild as HTMLElement | null;

    viewport.classList.add("flowranges-viewport");
    inner?.classList.add("flowranges-viewport-inner");

    return () => {
      viewport.classList.remove("flowranges-viewport");
      inner?.classList.remove("flowranges-viewport-inner");
    };
  }, [step.rootRef]);

  return (
    <div ref={step.rootRef} className="flowranges-root">
      <div className="flowranges-left">
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

        <Group justify="flex-end" className="flowranges-actions">
          <Button size="xs" onClick={step.applyThresholdsToFlowRanges}>
            {TextStore.interface("Bulletin17_Wizard_FlowRanges_ApplyChanges")}
          </Button>
        </Group>

        <div className="flowranges-table-wrap">
          <FlowRangesTable
            rows={step.rows}
            DATA_TYPES={step.DATA_TYPES}
            setCell={step.setCell}
            applyPasteGrid={step.applyPasteGrid}
            tableStyles={step.tableStyles}
          />
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
