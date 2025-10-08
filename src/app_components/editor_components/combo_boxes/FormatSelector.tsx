import React from "react";
import { SegmentedControl } from "@mantine/core";
import { TextStore } from "../../../utils/TextStore";

type Props = {
  value?: "DSS" | "JSON" | "";
  onChange: (value: "DSS" | "JSON" | "") => void;
};

export default function FormatSelector({ value, onChange }: Props) {
  return (
      <div className="manual-entry-row">
        <label className="manual-entry-label">
          {TextStore.interface("FormatSelector_Label")}
        </label>
        <div className="manual-entry-field">
          <SegmentedControl
              size="xs"
              value={value || ""}
              onChange={(v) => onChange((v as Props["value"]) || "")}
              data={[
                { label: TextStore.interface("FormatSelector_DSS"), value: "DSS" },
                { label: TextStore.interface("FormatSelector_JSON"), value: "JSON" },
              ]}
          />
        </div>
      </div>
  );
}
