import React, { useEffect } from 'react';

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
        // eslint-disable-next-line
    }, []);

    function handleCellChange(idx, field, value) {
        const updated = [...rows];
        updated[idx][field] = value;
        setRows(updated);
        // Auto-add row if last data row is filled
        if (
            idx === rows.length - 1 &&
            idx >= 3 &&
            (updated[idx].x || updated[idx].y)
        ) {
            setRows(ensureMinRows(updated, rows.length + 1));
        }
    }

    return (
        <div>
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
                        <input
                            className="manual-entry-input"
                            value="Units"
                            disabled
                            tabIndex={-1}
                            style={{ textAlign: "center" }}
                        />
                    </td>
                    <td>
                        <input
                            className="manual-entry-input"
                            value={xUnits}
                            disabled
                            style={{ textAlign: "center" }}
                        />
                    </td>
                    <td>
                        <input
                            className="manual-entry-input"
                            value={yUnits}
                            disabled
                            style={{ textAlign: "center" }}
                        />
                    </td>
                </tr>
                {/* Row 1: Type (X axis only) */}
                <tr>
                    <td>
                        <input
                            className="manual-entry-input"
                            value="Type"
                            disabled
                            tabIndex={-1}
                            style={{ textAlign: "center" }}
                        />
                    </td>
                    <td>
                        <select
                            className="manual-entry-input"
                            value={rows[1]?.x || "Linear"}
                            onChange={e => handleCellChange(1, "x", e.target.value)}
                        >
                            <option value="Linear">Linear</option>
                            <option value="Log">Log</option>
                        </select>
                    </td>
                    <td>
                        <input
                            className="manual-entry-input"
                            value=""
                            disabled
                            tabIndex={-1}
                            style={{ textAlign: "center" }}
                        />
                    </td>
                </tr>
                {/* Data rows */}
                {rows.slice(2).map((row, idx) => (
                    <tr key={2 + idx}>
                        <td>
                            <input
                                className="manual-entry-input"
                                value={idx + 1}
                                disabled
                                tabIndex={-1}
                                style={{ textAlign: "center" }}
                            />
                        </td>
                        <td>
                            <input
                                className="manual-entry-input"
                                type="number"
                                value={row.x || ""}
                                onChange={e => handleCellChange(2 + idx, "x", e.target.value)}
                                placeholder=""
                            />
                        </td>
                        <td>
                            <input
                                className="manual-entry-input"
                                type="number"
                                value={row.y || ""}
                                onChange={e => handleCellChange(2 + idx, "y", e.target.value)}
                                placeholder=""
                            />
                        </td>
                    </tr>
                ))}
                </tbody>
            </table>
        </div>
    );
}
