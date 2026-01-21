import React from "react";
import { Modal, Stack, Text, RingProgress, Group, Button } from "@mantine/core";
import TextStore from "../../../utils/TextStore";
import { StationSummary } from "./usgsImportLogic";

interface UsgsProgressDialogProps {
  opened: boolean;

  queryPercent: number;
  downloadPercent: number;
  writePercent: number;

  queryLabel: string | null;
  downloadLabel: string | null;
  writeLabel: string | null;

  done: boolean;
  summary?: StationSummary | null;

  onClose: () => void;
}

function clampPercent(percent: number): number {
  if (!Number.isFinite(percent))
    return 0;
  if (percent < 0)
    return 0;
  if (percent > 100)
    return 100;
  return percent;
}

const RING_SIZE = 96;

const RING_FIXED_STYLES = {
  root: {
    width: RING_SIZE,
    height: RING_SIZE,
    minWidth: RING_SIZE,
    minHeight: RING_SIZE,
  },
  svg: {
    width: RING_SIZE,
    height: RING_SIZE,
  },
};

export default function UsgsProgressDialog(props: UsgsProgressDialogProps) {
  const {
    opened,
    queryPercent,
    downloadPercent,
    writePercent,
    queryLabel,
    downloadLabel,
    writeLabel,
    done,
    summary,
    onClose,
  } = props;

  const queryPct = clampPercent(queryPercent);
  const downloadPct = clampPercent(downloadPercent);
  const writePct = clampPercent(done ? 100 : writePercent);

  return (
    <Modal
      opened={opened}
      onClose={done ? onClose : () => {}}
      withCloseButton={done}
      centered
      size="lg"
      overlayProps={{ opacity: 0.55, blur: 2 }}
      title={TextStore.interface("UsgsDataImporter_Import_Title")}
    >
      <Stack gap="md" align="center" style={{ paddingTop: 16, paddingBottom: 16 }}>
        <Group w="100%" justify="space-between" align="flex-start" wrap="nowrap">
          <Stack align="center" style={{ flex: 1 }}>
            <RingProgress
              size={RING_SIZE}
              sections={[{ value: queryPct, color: "blue" }]}
              label={<Text size="sm" fw={500} ta="center">{Math.round(queryPct)}%</Text>}
              styles={RING_FIXED_STYLES}
            />
            <Text size="xs" ta="center" style={{ maxWidth: 240 }}>
              {queryLabel || ""}
            </Text>
          </Stack>

          <Stack align="center" style={{ flex: 1 }}>
            <RingProgress
              size={RING_SIZE}
              sections={[{ value: downloadPct, color: "yellow" }]}
              label={<Text size="sm" fw={500} ta="center">{Math.round(downloadPct)}%</Text>}
              styles={RING_FIXED_STYLES}
            />
            <Text size="xs" ta="center" style={{ maxWidth: 240 }}>
              {downloadLabel || ""}
            </Text>
          </Stack>

          <Stack align="center" style={{ flex: 1 }}>
            <RingProgress
              size={RING_SIZE}
              sections={[{ value: writePct, color: "green" }]}
              label={<Text size="sm" fw={500} ta="center">{Math.round(writePct)}%</Text>}
              styles={RING_FIXED_STYLES}
            />
            <Text size="xs" ta="center" style={{ maxWidth: 240 }}>
              {writeLabel || TextStore.interface("UsgsDataImporter_Import_Write_Preparing")}
            </Text>
          </Stack>
        </Group>

        {done && summary && (
          <Stack gap={4} align="center" style={{ marginTop: 8 }}>
            <Text size="sm">
              {TextStore.interface("UsgsDataImporter_Import_Summary_TotalSeries")}
              {summary.totalSeriesRequested}
            </Text>
            <Text size="sm">
              {TextStore.interface("UsgsDataImporter_Import_Summary_WithData")}
              {summary.withDataCount}
            </Text>
            <Text size="sm">
              {TextStore.interface("UsgsDataImporter_Import_Summary_WithoutData")}
              {summary.noDataCount}
            </Text>
            <Text size="sm">
              {TextStore.interface("UsgsDataImporter_Import_Summary_Failed")}
              {summary.failedCount}
            </Text>

            <Button onClick={onClose}>{TextStore.interface("UsgsDataImporter_Import_Close_Button")}</Button>
          </Stack>
        )}
      </Stack>
    </Modal>
  );
}
