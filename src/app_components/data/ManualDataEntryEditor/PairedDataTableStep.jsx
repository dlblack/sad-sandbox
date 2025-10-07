import React, { useEffect } from "react";
import { Card, TextInput, NumberInput, Select } from "@mantine/core";

function ensureMinRows(rows, minLength = 8) {
  const next = [...rows];
  while (next.length < minLength) next.push({ x: "", y: "" });
  return next;
}

export default function PairedDataTableStep({
                                              rows,
                                              setRows,
                                              yLabel,
                                              yUnits,
                                              xLabel,
                                              xUnits,
                                            }) {
  useEffect(() => {
    if (rows.length < 8) setRows(ensureMinRows(rows, 8));
  }, []);

  function handleCellChange(idx, field, value) {
    const updated = [...rows];
    updated[idx][field] = value;
    setRows(updated);
    if (
      idx === rows.length - 1 &&
      idx >= 3 &&
      (updated[idx].x || updated[idx].y)
    ) {
      setRows(ensureMinRows(updated, rows.length + 1));
    }
  }

  const ordinals = ["1","2","3","4","5","6","7","8","9","10","11","12","13","14","15"];

  return (
    <Card withBorder radius="md" padding="xs">
      <table className="manual-entry-table">
        <thead>
        <tr>
          <th className="manual-entry-th" style={{ width: 80 }}>Ordinate</th>
          <th className="manual-entry-th" style={{ width: 130 }}>{xLabel || "X"}</th>
          <th className="manual-entry-th" style={{ width: 130 }}>{yLabel || "Y"}</th>
        </tr>
        </thead>
        <tbody>
        {/* Row 0: Units */}
        <tr>
          <td>
            <TextInput
              className="manual-entry-input"
              value="Units"
              readOnly
              tabIndex={-1}
              styles={{ input: { textAlign: "center" } }}
            />
          </td>
          <td>
            <TextInput
              className="manual-entry-input"
              value={xUnits}
              readOnly
              styles={{ input: { textAlign: "center" } }}
            />
          </td>
          <td>
            <TextInput
              className="manual-entry-input"
              value={yUnits}
              readOnly
              styles={{ input: { textAlign: "center" } }}
            />
          </td>
        </tr>
        {/* Row 1: Type (X axis only) */}
        <tr>
          <td>
            <TextInput
              className="manual-entry-input"
              value="Type"
              readOnly
              tabIndex={-1}
              styles={{ input: { textAlign: "center" } }}
            />
          </td>
          <td>
            <Select
              className="manual-entry-input"
              value={rows[1]?.x || "Linear"}
              onChange={(v) => handleCellChange(1, "x", v || "Linear")}
              data={[
                { label: "Linear", value: "Linear" },
                { label: "Log", value: "Log" }
              ]}
            />
          </td>
          <td>
            <TextInput
              className="manual-entry-input"
              value=""
              readOnly
              tabIndex={-1}
              styles={{ input: { textAlign: "center" } }}
            />
          </td>
        </tr>
        {/* Data rows */}
        {rows.slice(2).map((row, idx) => (
          <tr key={`row-${idx}`}>
            <td>
              <TextInput
                className="manual-entry-input"
                value={ordinals[idx] || String(idx + 1)}
                readOnly
                tabIndex={-1}
                styles={{ input: { textAlign: "center" } }}
              />
            </td>
            <td>
              <NumberInput
                className="manual-entry-input"
                size="xs"
                hideControls
                value={row.x === "" ? "" : Number(row.x)}
                onChange={(v) => handleCellChange(2 + idx, "x", v === "" || v == null ? "" : String(v))}
              />
            </td>
            <td>
              <NumberInput
                className="manual-entry-input"
                size="xs"
                hideControls
                value={row.y === "" ? "" : Number(row.y)}
                onChange={(v) => handleCellChange(2 + idx, "y", v === "" || v == null ? "" : String(v))}
              />
            </td>
          </tr>
        ))}
        </tbody>
      </table>
    </Card>
  );
}
