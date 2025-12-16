import React, { useEffect, useState } from "react";
import { Modal, Stack, Text, Select, Group, Button } from "@mantine/core";
import TextStore from "../utils/TextStore";

export interface UsgsStationIdsByStateDialogProps {
  opened: boolean;
  dataTypeLabel: string;
  stateOptions: { value: string; label: string }[];
  onConfirm: (stateCode: string) => void;
  onCancel: () => void;
}

export default function UsgsStationIdsByStateDialog(
  props: UsgsStationIdsByStateDialogProps,
) {
  const { opened, dataTypeLabel, stateOptions, onConfirm, onCancel } = props;
  const [selection, setSelection] = useState<string | null>(null);

  useEffect(() => {
    if (opened) {
      setSelection(null);
    }
  }, [opened]);

  function handleOk() {
    if (!selection) return;
    onConfirm(selection);
  }

  return (
    <Modal
      opened={opened}
      onClose={onCancel}
      title={TextStore.interface("UsgsStationIdsByStateDialog_Title")}
      size="sm"
      centered
      withCloseButton
      overlayProps={{ opacity: 0.45, blur: 2 }}
      trapFocus
      withinPortal
    >
      <Stack gap="sm">
        <Text size="sm">{TextStore.interface("UsgsStationIdsByStateDialog_DataType")} {dataTypeLabel}</Text>
        <Select
          label={TextStore.interface("UsgsStationIdsByStateDialog_State")}
          placeholder={TextStore.interface("UsgsStationIdsByStateDialog_State_Placeholder")}
          data={stateOptions}
          searchable
          value={selection}
          onChange={setSelection}
        />
        <Group justify="flex-end" mt="sm">
          <Button variant="default" size="xs" onClick={onCancel}>
            Cancel
          </Button>
          <Button size="xs" onClick={handleOk} disabled={!selection}>
            OK
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}
