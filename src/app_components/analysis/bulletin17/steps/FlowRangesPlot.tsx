import React, { useEffect, useMemo } from "react";
import { Button, Group, Stack } from "@mantine/core";
import Chart from "../../../plots/Chart";
import { TextStore } from "../../../../utils/TextStore";
import type { Layout, PlotData } from "plotly.js";
import { usePopout } from "../../../../popout/PopoutProvider";

type Props = {
  plotKey: number;
  refreshPlot: () => void;
  plotData: Partial<PlotData>[];
  layout: Partial<Layout>;
  popoutId?: string;
  popoutOwnerKey?: string;
};

export function FlowRangesPlot({
                                 plotKey,
                                 refreshPlot,
                                 plotData,
                                 layout,
                                 popoutId = "flowRangesPlot",
                                 popoutOwnerKey,
                               }: Props) {
  const popout = usePopout();

  const model = useMemo(
    () => ({
      plotKey,
      plotData,
      layout,
      title: TextStore.interface("Bulletin17_Wizard_FlowRanges_Label"),
    }),
    [plotKey, plotData, layout]
  );

  useEffect(() => {
    if (!popout.isOpen(popoutId)) return;
    popout.updateModel(popoutId, "plot", model);
  }, [popout, popoutId, model]);

  const openPopout = () => {
    popout.open(
      {
        id: popoutId,
        kind: "plot",
        title: TextStore.interface("Bulletin17_Wizard_FlowRanges_Label"),
        ownerKey: popoutOwnerKey,
      },
      {
        onRefresh: refreshPlot,
      }
    );

    popout.updateModel(popoutId, "plot", model);
  };

  return (
    <div className="flow-ranges-plot">
      <Stack align="stretch" justify="center" gap="md">
        <Chart key={plotKey} data={plotData as any} layout={layout as any} />

        <Group justify="space-between" mb="xs" className="flow-ranges-group">
          <Button size="xs" variant="default" onClick={openPopout}>
            Pop out
          </Button>

          <Button size="xs" onClick={refreshPlot}>
            {TextStore.interface("Bulletin17_Wizard_FlowRanges_RefreshPlot")}
          </Button>
        </Group>
      </Stack>
    </div>
  );
}
