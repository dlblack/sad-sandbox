import React, { useState } from "react";
import {
  Badge,
  Button,
  Checkbox,
  Group,
  Stack,
  Table,
  Text,
  TextInput,
  ActionIcon,
  Tooltip,
} from "@mantine/core";
import { IconTrash } from "@tabler/icons-react";
import { StationRow } from "./usgsImportLogic";
import TextStore from "../../../utils/TextStore";

export interface UsgsStationsStepProps {
  stations: StationRow[];
  retrievedStates: string[];
  onAddRow: () => void;
  onChangeStationField: (
    index: number,
    field: keyof StationRow,
    value: string | boolean,
  ) => void;
  onToggleAllImport: (flag: boolean) => void;
  onDeleteRow: (index: number) => void;
}

type ColumnKey = "import" | "id" | "a" | "b" | "f" | "actions";

export default function UsgsStationsStep(props: UsgsStationsStepProps) {
  const {
    stations,
    retrievedStates,
    onAddRow,
    onChangeStationField,
    onToggleAllImport,
    onDeleteRow,
  } = props;

  const [columnWidths, setColumnWidths] = useState<Record<ColumnKey, number>>({
    import: 80,
    id: 130,
    a: 230,
    b: 260,
    f: 160,
    actions: 70,
  });

  function startResize(columnKey: ColumnKey, ev: React.MouseEvent) {
    ev.preventDefault();
    const startX = ev.clientX;
    const startWidth = columnWidths[columnKey];

    function onMove(moveEv: MouseEvent) {
      const delta = moveEv.clientX - startX;
      setColumnWidths((prev) => {
        const next = { ...prev };
        const raw = startWidth + delta;
        const minWidth = 60;
        next[columnKey] = raw < minWidth ? minWidth : raw;
        return next;
      });
    }

    function onUp() {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    }

    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
  }

  const allSelected =
    stations.length > 0 && stations.every((row) => row.importFlag);
  const toggleLabel = allSelected
    ? TextStore.interface("UsgsDataImporter_Import_Unselect_Button")
    : TextStore.interface("UsgsDataImporter_Import_Unselect_Button");

  function renderResizableHeader(
    key: ColumnKey,
    label: React.ReactNode,
    extraStyle?: React.CSSProperties,
  ) {
    return (
      <Table.Th
        style={{
          width: columnWidths[key],
          position: "relative",
          ...extraStyle,
        }}
      >
        <div className="th-inner">{label}</div>
        <div
          className="col-resizer"
          onMouseDown={(ev) => startResize(key, ev)}
        />
      </Table.Th>
    );
  }

  return (
    <div className="manual-entry-content">
      <Stack gap="xs" mb="xs">
        <Text size="sm">
          {TextStore.interface("UsgsDataImporter_Import_SelectStations_Label")}
        </Text>
        {retrievedStates.length > 0 && (
          <Group gap="xs">
            <Text size="sm">{TextStore.interface("UsgsDataImporter_Import_StatesRetrieved_Label")}</Text>
            {retrievedStates.map((st) => (
              <Badge key={st} size="xs" radius="sm">
                {st}
              </Badge>
            ))}
          </Group>
        )}
      </Stack>

      <Group justify="space-between" mb="xs">
        <Text size="sm">{TextStore.interface("UsgsDataImporter_Import_StationsToImport_Label")}</Text>
        <Group gap="xs">
          <Button
            size="xs"
            variant="default"
            onClick={() => onToggleAllImport(!allSelected)}
          >
            {toggleLabel}
          </Button>
          <Button size="xs" onClick={onAddRow}>
            {TextStore.interface("UsgsDataImporter_Import_AddStationRow_Button")}
          </Button>
        </Group>
      </Group>

      <Table striped withTableBorder withColumnBorders className="table-resizable">
        <Table.Thead>
          <Table.Tr>
            {renderResizableHeader("import", "Import", { textAlign: "center" })}
            {renderResizableHeader("id", "Station ID")}
            {renderResizableHeader("a", "Basin Name (A Part)")}
            {renderResizableHeader("b", "Location (B Part)")}
            {renderResizableHeader("f", "Other Qualifier (F Part)")}
            {renderResizableHeader("actions", "Delete Row", { textAlign: "center" })}
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {stations.map((row, idx) => (
            <Table.Tr key={idx}>
              <Table.Td style={{ textAlign: "center" }}>
                <Checkbox
                  checked={row.importFlag}
                  onChange={(e) =>
                    onChangeStationField(
                      idx,
                      "importFlag",
                      e.currentTarget.checked,
                    )
                  }
                />
              </Table.Td>
              <Table.Td>
                <TextInput
                  size="xs"
                  value={row.id}
                  placeholder="e.g. 01234567"
                  onChange={(e) =>
                    onChangeStationField(idx, "id", e.currentTarget.value)
                  }
                />
              </Table.Td>
              <Table.Td>
                <TextInput
                  size="xs"
                  value={row.aPart}
                  placeholder="Basin name"
                  onChange={(e) =>
                    onChangeStationField(idx, "aPart", e.currentTarget.value)
                  }
                />
              </Table.Td>
              <Table.Td>
                <TextInput
                  size="xs"
                  value={row.bPart}
                  placeholder="Location"
                  onChange={(e) =>
                    onChangeStationField(idx, "bPart", e.currentTarget.value)
                  }
                />
              </Table.Td>
              <Table.Td>
                <TextInput
                  size="xs"
                  value={row.fPart}
                  onChange={(e) =>
                    onChangeStationField(idx, "fPart", e.currentTarget.value)
                  }
                />
              </Table.Td>
              <Table.Td style={{ textAlign: "center" }}>
                <Tooltip label="Delete row" withArrow>
                  <ActionIcon
                    color="red"
                    variant="subtle"
                    onClick={() => onDeleteRow(idx)}
                  >
                    <IconTrash size={16} />
                  </ActionIcon>
                </Tooltip>
              </Table.Td>
            </Table.Tr>
          ))}
        </Table.Tbody>
      </Table>
    </div>
  );
}
