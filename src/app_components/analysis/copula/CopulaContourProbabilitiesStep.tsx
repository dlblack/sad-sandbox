import React, { useEffect, useState } from "react";
import { Box, Checkbox, ScrollArea, Table, Text } from "@mantine/core";
import { TextStore } from "../../../utils/TextStore";
import { WizardStep, WizardCtx } from "../components/WizardRunner";

const BAG_KEY_PROBS = "copulaContourProbabilities";
const BAG_KEY_IS_CUM = "copulaContourIsCumulative";

function normalizeNumberInput(v: string): string {
    const s = v.trim();
    if (s === "") return s;
    const cleaned = s.replace(/[^0-9.]/g, "");
    const parts = cleaned.split(".");
    if (parts.length > 2) {
        return `${parts[0]}.${parts.slice(1).join("")}`;
    }
    return cleaned;
}

function ensureAtLeastN<T>(arr: T[], n: number, filler: T): T[] {
    if (arr.length >= n) return arr;
    const out = arr.slice();
    const need = n - out.length;
    for (let i = 0; i < need; i++) out.push(filler);
    return out;
}

type PanelProps = {
    initialRows: string[];
    initialIsCumulative: boolean;
    setBag: WizardCtx["setBag"];
};

function Panel({ initialRows, initialIsCumulative, setBag }: PanelProps) {
    const [rows, setRows] = useState<string[]>(
        ensureAtLeastN(initialRows ?? [], 5, "")
    );
    const [isCumulative, setIsCumulative] = useState<boolean>(
        initialIsCumulative
    );

    useEffect(() => {
        setBag((prev) => ({
            ...(prev as Record<string, unknown>),
            [BAG_KEY_PROBS]: rows,
            [BAG_KEY_IS_CUM]: isCumulative,
        }));
    }, [rows, isCumulative, setBag]);

    const headerLabel =
        isCumulative
            ? TextStore.interface("Copula_Wizard_StepContProb_HeaderCum") ??
            "Cumulative Probabilities"
            : TextStore.interface("Copula_Wizard_StepContProb_HeaderAEP") ??
            "Annual Exceedance Probabilities";

    return (
        <Box>
            <Text fw={600} mb="xs">
                {TextStore.interface("Copula_Wizard_StepContProb_DispCumulativeProb")}
            </Text>

            <Checkbox
                checked={isCumulative}
                onChange={(e) => setIsCumulative(e.currentTarget.checked)}
                label={TextStore.interface("Copula_Wizard_StepContProb_DispCumulativeProb")}
                mb="sm"
            />

            {/* inner scroll so the table never collides with the wizard footer */}
            <ScrollArea style={{ maxHeight: "48vh" }} type="auto">
                <Table withTableBorder verticalSpacing="xs" horizontalSpacing="sm" stickyHeader>
                    <Table.Thead>
                        <Table.Tr>
                            <Table.Th>{headerLabel}</Table.Th>
                        </Table.Tr>
                    </Table.Thead>
                    <Table.Tbody>
                        {rows.map((val, i) => (
                            <Table.Tr key={`prob-row-${i}`}>
                                <Table.Td style={{ padding: 0 }}>
                                    <input
                                        aria-label={`prob-${i}`}
                                        value={val}
                                        onChange={(e) => {
                                            const nextVal = normalizeNumberInput(e.target.value);
                                            setRows((prev) => {
                                                const next = prev.slice();
                                                next[i] = nextVal;

                                                // if editing the last row and it now has a value, append a new empty row
                                                const lastIndex = prev.length - 1;
                                                const editingLast = i === lastIndex;
                                                const hasValue = nextVal.trim() !== "";
                                                if (editingLast && hasValue) {
                                                    return [...next, ""];
                                                }
                                                return next;
                                            });
                                        }}
                                        inputMode="decimal"
                                        style={{
                                            width: "100%",
                                            border: "none",
                                            outline: "none",
                                            padding: "10px 12px",
                                            background:
                                                i % 2 === 0 ? "var(--mantine-color-dark-6)" : "",
                                            color: "inherit",
                                        }}
                                    />
                                </Table.Td>
                            </Table.Tr>
                        ))}
                    </Table.Tbody>
                </Table>
            </ScrollArea>
        </Box>
    );
}

export default function makeCopulaContourProbabilitiesStep(): WizardStep {
    return {
        label: TextStore.interface("Copula_Wizard_StepContProb"),
        render: (ctx: WizardCtx) => {
            const bag = (ctx.bag ?? {}) as Record<string, unknown>;

            const initialRows = ensureAtLeastN(
                (bag[BAG_KEY_PROBS] as string[] | undefined) ?? [],
                5,
                ""
            );
            const initialIsCumulative = (bag[BAG_KEY_IS_CUM] as boolean | undefined) ?? false;

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
