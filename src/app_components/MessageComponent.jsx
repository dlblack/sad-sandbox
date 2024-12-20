import React, { useContext } from "react";
import { StyleContext } from "../styles/StyleContext";

function MessageComponent() {
  const { style } = useContext(StyleContext);

  return (
    <div style={{ backgroundColor: "#fff", padding: "10px" }}>
      <div className="text-info">Info: This line is using "text-info".</div>
      <div className="text-danger">Danger: This line is using "text-danger".</div>
      <div className="text-warning">Warning: This line is using "text-warning".</div>
      <div className="text-success">Success: This line is using "text-success".</div>
    </div>
  );
}

export default MessageComponent;
