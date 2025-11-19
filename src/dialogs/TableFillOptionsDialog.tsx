import React, { useState } from "react";
import {
    Button,
    Group,
    Modal,
    NumberInput,
    Radio,
    Stack,
    Text
} from "@mantine/core";
import { TableFillMode } from "../utils/tableFillUtils";
import { TextStore } from "../utils/TextStore";

export interface TableFillOptionsDialogProps {
    opened: boolean;
    onClose: () => void;
    onApply: (mode: TableFillMode, constant?: number) => void;
}

export default function TableFillOptionsDialog({
                                                   opened,
                                                   onClose,
                                                   onApply
                                               }: TableFillOptionsDialogProps) {
    const [mode, setMode] = useState<TableFillMode>("linear");
    const [constantStr, setConstantStr] = useState("");

    function handleOk() {
        let constant: number | undefined;
        if (mode === "addConstant" || mode === "multiplyConstant") {
            const n = parseFloat(constantStr);
            if (!Number.isFinite(n)) {
                return;
            }
            constant = n;
        }
        onApply(mode, constant);
    }

    const needsConstant =
        mode === "addConstant" || mode === "multiplyConstant";

    return (
        <Modal
            opened={opened}
            onClose={onClose}
            title={TextStore.interface?.("TableFillOptions_Title")}
            size="sm"
            centered
            withCloseButton
            overlayProps={{ opacity: 0.45, blur: 2 }}
            trapFocus
            withinPortal
        >
            <Stack gap="sm">
                <Radio.Group
                    value={mode}
                    onChange={(v) => setMode(v as TableFillMode)}
                >
                    <Stack gap={4}>
                        <Radio
                            value="linear"
                            label={TextStore.interface?.("TableFillOptions_Linear")}
                        />
                        <Radio
                            value="repeat"
                            label={TextStore.interface?.("TableFillOptions_Repeat")}
                        />
                        <Radio
                            value="repeatToEnd"
                            label={TextStore.interface?.("TableFillOptions_RepeatToEnd")}
                        />
                        <Radio
                            value="addConstant"
                            label={TextStore.interface?.("TableFillOptions_AddConstant")}
                        />
                        <Radio
                            value="multiplyConstant"
                            label={TextStore.interface?.("TableFillOptions_MultiplyConstant")}
                        />
                    </Stack>
                </Radio.Group>

                <div>
                    <Text size="xs" mb={4}>
                        {TextStore.interface?.("TableFillOptions_Constant")}
                    </Text>
                    <NumberInput
                        size="xs"
                        hideControls
                        value={constantStr}
                        onChange={(v) => setConstantStr(v?.toString() ?? "")}
                        inputMode="decimal"
                        placeholder="e.g. 5, 2, 0.5"
                        disabled={!needsConstant}
                    />
                </div>

                <Group justify="flex-end" mt="sm">
                    <Button variant="default" size="xs" onClick={onClose}>
                        {TextStore.interface?.("TableFillOptions_Cancel_Button")}
                    </Button>
                    <Button size="xs" onClick={handleOk}>
                        {TextStore.interface?.("TableFillOptions_OK_Button")}
                    </Button>
                </Group>
            </Stack>
        </Modal>
    );
}
