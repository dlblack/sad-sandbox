import React from "react";
import { SegmentedControl } from "@mantine/core";
import { TextStore } from "../../../utils/TextStore";

type Props = {
    value?: "TimeSeries" | "PairedData" | "";
    onChange: (value: "TimeSeries" | "PairedData" | "") => void;
};

export default function StructureSelector({ value, onChange }: Props) {
    return (
        <div className="manual-entry-row">
            <label className="manual-entry-label">
                {TextStore.interface("StructureSelector_Label")}
            </label>
            <div className="manual-entry-field">
                <SegmentedControl
                    size="xs"
                    value={value || ""}
                    onChange={(v) => onChange((v as Props["value"]) || "")}
                    data={[
                        { label: TextStore.interface("StructureSelector_TimeSeries"), value: "TimeSeries" },
                        { label: TextStore.interface("StructureSelector_PairedData"), value: "PairedData" },
                    ]}
                />
            </div>
        </div>
    );
}
