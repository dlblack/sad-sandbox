import React, { useEffect, useState } from "react";
import { Box, Checkbox, Text } from "@mantine/core";
import { TextStore } from "../../../../utils/TextStore";
import { WizardStep, WizardCtx } from "../../_shared/WizardRunner";
import EditableTable from "../../../table/EditableTable";

const BAG_KEY_PROBS = "copulaContourProbabilities";
const BAG_KEY_IS_CUM = "copulaContourIsCumulative";

const DEFAULT_AEP = ["0.5", "0.1", "0.05", "0.02", "0.01", "0.005", "0.002", "0.001"];
const DEFAULT_CUMULATIVE = ["0.5", "0.9", "0.95", "0.98", "0.99", "0.995", "0.998", "0.999"];

type ProbRow = { probability: string };

function Panel({ initialRows, initialIsCumulative, setBag }: any) {
  const [data, setData] = useState<ProbRow[]>(
    initialRows.map((p: string) => ({ probability: p }))
  );
  const [isCumulative, setIsCumulative] = useState(initialIsCumulative);

  useEffect(() => {
    setBag((prev: any) => ({
      ...prev,
      [BAG_KEY_PROBS]: data.map((r) => r.probability),
      [BAG_KEY_IS_CUM]: isCumulative,
    }));
  }, [data, isCumulative, setBag]);

  const handleCumulativeToggle = (checked: boolean) => {
    setIsCumulative(checked);
    const newDefaults = checked ? DEFAULT_CUMULATIVE : DEFAULT_AEP;
    setData([...newDefaults.map((p) => ({ probability: p })), { probability: "" }]);
  };

  const headerLabel = isCumulative
    ? TextStore.interface("Copula_Wizard_StepContProb_HeaderCum")
    : TextStore.interface("Copula_Wizard_StepContProb_HeaderAEP");

  const columns = [
    {
      key: "probability",
      label: headerLabel,
      parse: (v: string) => {
        const num = Number(v);
        return Number.isFinite(num) ? num : "";
      },
    },
  ];

  return (
    <Box>
      <Text fw={600} mb="xs">
        {TextStore.interface("Copula_Wizard_StepContProb_Label")}
      </Text>

      <Checkbox
        checked={isCumulative}
        onChange={(e) => handleCumulativeToggle(e.currentTarget.checked)}
        label={TextStore.interface("Copula_Wizard_StepContProb_DispCumulativeProb")}
        mb="sm"
      />

      <EditableTable
        data={data}
        columns={columns}
        onChange={setData}
        minRows={8}
        enableContextMenu={true}
      />
    </Box>
  );
}

export default function makeCopulaContourProbabilitiesStep(): WizardStep {
  return {
    label: TextStore.interface("Copula_Wizard_StepContProb"),
    render: (ctx: WizardCtx) => {
      const bag = (ctx.bag ?? {}) as Record<string, unknown>;
      const initialIsCumulative = (bag[BAG_KEY_IS_CUM] as boolean) ?? false;
      const bagRows = (bag[BAG_KEY_PROBS] as string[]) ?? [];
      const defaultRows = initialIsCumulative ? DEFAULT_CUMULATIVE : DEFAULT_AEP;
      const initialRows = bagRows.length > 0 ? bagRows : [...defaultRows, ""];

      return (
        <Panel
          initialRows={initialRows}
          initialIsCumulative={initialIsCumulative}
          setBag={ctx.setBag}
        />
      );
    },
  };
}