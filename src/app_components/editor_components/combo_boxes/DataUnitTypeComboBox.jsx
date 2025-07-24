import React from "react";

const DATA_TYPE_OPTIONS = [
    { value: "PerAver", label: "PER-AVER" },
    { value: "PerCum", label: "PER-CUM" },
    { value: "InstVal", label: "INST-VAL" },
    { value: "InstCum", label: "INST-CUM" },
];

export default function DataUnitTypeComboBox({ value, onChange, ...props }) {
    return (
        <select
            className="form-select font-xs"
            value={value}
            onChange={e => onChange(e.target.value)}
            {...props}
        >
            <option value="">Select Unit Type</option>
            {DATA_TYPE_OPTIONS.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
        </select>
    );
}
