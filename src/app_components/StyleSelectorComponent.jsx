import React, { useContext, useState } from "react";
import { StyleContext } from "../styles/StyleContext";

function StyleSelectorComponent() {
  const { toggleStyle } = useContext(StyleContext);
  const [selectedStyle, setSelectedStyle] = useState("bg-secondary text-white");

  const handleStyleChange = (event) => {
    const newStyle = event.target.value;
    setSelectedStyle(newStyle);
    toggleStyle(newStyle);
  };

  return (
    <div className="card text-white bg-secondary mb-3" style={{ height: "100%" }}>
      <div className="card-body">
        <form>
          <div className="form-group">
            <label htmlFor="styleSelect">Choose Style</label>
            <select
              id="styleSelect"
              className="form-control"
              value={selectedStyle}
              onChange={handleStyleChange}
            >
              <option value="bg-primary text-white">Primary</option>
              <option value="bg-secondary text-white">Secondary</option>
              <option value="bg-light text-dark">Light</option>
              <option value="bg-dark text-white">Dark</option>
              <option value="bg-success text-white">Success</option>
            </select>
          </div>
        </form>
      </div>
    </div>
  );
}

export default StyleSelectorComponent;
