import React from "react";
import ComponentMessage from "../ComponentMessage.jsx";

export default function SouthZoneComponents({ messages = [], onRemove }) {
  return (
    <div className="wizard-workspace">
      <div className="wizard-tab-body">
        <ComponentMessage messages={messages} onRemove={onRemove} />
      </div>
    </div>
  );
}
