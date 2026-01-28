import React from "react";
import { Paper, Stack, Divider } from "@mantine/core";
import MenuItem from "./MenuItem";
import TextStore from "../../utils/TextStore";

export interface TableContextMenuProps {
  menuPos: { x: number; y: number } | null;
  onMouseLeave: () => void;
  onCut: () => void;
  onCopy: () => void;
  onPaste: () => void;
  onClear: () => void;
  onInsert: () => void;
  onFill: () => void;
  onSelectAll: () => void;
  onDeleteRows: () => void;
}

export default function TableContextMenu({
                                           menuPos,
                                           onMouseLeave,
                                           onCut,
                                           onCopy,
                                           onPaste,
                                           onClear,
                                           onFill,
                                           onSelectAll,
                                           onInsert,
                                           onDeleteRows,
                                       }: TableContextMenuProps) {
  if (!menuPos) return null;

  return (
    <Paper
      className="table-right-click-menu"
      shadow="md"
      withBorder
      radius="xs"
      p={0}
      style={{
          top: menuPos.y,
          left: menuPos.x,
      }}
      onMouseLeave={onMouseLeave}
    >
      <Stack gap={0} style={{ fontSize: 12, lineHeight: 1.25 }}>
        <MenuItem onClick={onCut}>
          {TextStore.interface("TableContext_Cut")}
        </MenuItem>
        <MenuItem onClick={onCopy}>
          {TextStore.interface("TableContext_Copy")}
        </MenuItem>
        <MenuItem onClick={onPaste}>
          {TextStore.interface("TableContext_Paste")}
        </MenuItem>
        <MenuItem onClick={onClear}>
          {TextStore.interface("TableContext_Clear")}
        </MenuItem>
        <Divider />
        <MenuItem onClick={onFill}>
          {TextStore.interface("TableContext_Fill")}
        </MenuItem>
        <Divider />
        <MenuItem onClick={onSelectAll}>
          {TextStore.interface("TableContext_SelectAll")}
        </MenuItem>
        <MenuItem onClick={onInsert}>
          {TextStore.interface("TableContext_Insert")}
        </MenuItem>
        <MenuItem onClick={onDeleteRows}>
          {TextStore.interface("TableContext_DeleteRows")}
        </MenuItem>
      </Stack>
    </Paper>
  );
}
