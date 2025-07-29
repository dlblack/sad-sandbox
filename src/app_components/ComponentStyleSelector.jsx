import React, {useContext, useState} from "react";
import {StyleContext} from "../styles/StyleContext";

function ComponentStyleSelector() {
  const {
    appBackgroundStyle,
    navbarStyle,
    componentHeaderStyle,
    componentBackgroundStyle,
    toggleAppBackgroundStyle,
    toggleNavbarStyle,
    toggleComponentHeaderStyle,
    toggleComponentBackgroundStyle,
  } = useContext(StyleContext);


  const [selectedAppBackgroundStyle, setSelectedAppBackgroundStyle] = useState(appBackgroundStyle);
  const [selectedNavbarStyle, setSelectedNavbarStyle] = useState(navbarStyle);
  const [selectedComponentHeaderStyle, setSelectedComponentHeaderStyle] = useState(componentHeaderStyle);
  const [selectedComponentBackgroundStyle, setSelectedComponentBackgroundStyle] = useState(componentBackgroundStyle);

  const handleAppBackgroundStyleChange = (event) => {
    const newStyle = event.target.value;
    setSelectedAppBackgroundStyle(newStyle);
    toggleAppBackgroundStyle(newStyle);
  };

  const handleNavbarStyleChange = (event) => {
    const newStyle = event.target.value;
    setSelectedNavbarStyle(newStyle);
    toggleNavbarStyle(newStyle);
  };

  const handleComponentHeaderStyleChange = (event) => {
    const newStyle = event.target.value;
    setSelectedComponentHeaderStyle(newStyle);
    toggleComponentHeaderStyle(newStyle);
  };

  const handleComponentBackgroundStyleChange = (event) => {
    const newStyle = event.target.value;
    setSelectedComponentBackgroundStyle(newStyle);
    toggleComponentBackgroundStyle(newStyle);
  }

  return (
    <div className={`card text-white mb-2 ${componentBackgroundStyle}`}>
      <div>
        <form>
          <div className="style-selector-row">
            <label htmlFor="appBackgroundStyleSelect" className="style-selector-label">
              App Background
            </label>
            <select
              id="appBackgroundStyleSelect"
              className="form-control form-control-sm style-selector-compact flex-grow-1"
              value={selectedAppBackgroundStyle}
              onChange={handleAppBackgroundStyleChange}
            >
              <option value="bg-primary">Primary</option>
              <option value="bg-secondary">Secondary</option>
              <option value="bg-dark">Light</option>
              <option value="bg-light">Dark</option>
              <option value="bg-danger text-white">Danger</option>
              <option value="bg-warning text-white">Warning</option>
              <option value="bg-info text-white">Info</option>
              <option value="bg-success">Success</option>
            </select>
          </div>

          <div className="style-selector-row">
            <label htmlFor="navbarStyleSelect" className="style-selector-label">
              Navbar Style
            </label>
            <select
              id="navbarStyleSelect"
              className="form-control form-control-sm style-selector-compact flex-grow-1"
              value={selectedNavbarStyle}
              onChange={handleNavbarStyleChange}
            >
              <option value="bg-primary navbar-dark">Primary</option>
              <option value="bg-secondary navbar-dark">Secondary</option>
              <option value="bg-light navbar-light">Light</option>
              <option value="bg-dark navbar-dark">Dark</option>
            </select>
          </div>

          <div className="style-selector-row">
            <label htmlFor="componentHeaderStyleSelect" className="style-selector-label">
              Component Header Style
            </label>
            <select
              id="componentHeaderStyleSelect"
              className="form-control form-control-sm style-selector-compact flex-grow-1"
              value={selectedComponentHeaderStyle}
              onChange={handleComponentHeaderStyleChange}
            >
              <option value="bg-primary text-white">Primary</option>
              <option value="bg-secondary text-white">Secondary</option>
              <option value="bg-dark text-dark">Light</option>
              <option value="bg-light text-white">Dark</option>
              <option value="bg-danger text-white">Danger</option>
              <option value="bg-warning text-white">Warning</option>
              <option value="bg-info text-white">Info</option>
              <option value="bg-success text-white">Success</option>
            </select>
          </div>

          <div className="style-selector-row">
            <label htmlFor="componentBackgroundStyleSelect" className="style-selector-label">
              Component Background Style
            </label>
            <select
              id="componentBackgroundStyleSelect"
              className="form-control form-control-sm style-selector-compact flex-grow-1"
              value={selectedComponentBackgroundStyle}
              onChange={handleComponentBackgroundStyleChange}
            >
              <option value="bg-primary text-white">Primary</option>
              <option value="bg-secondary text-white">Secondary</option>
              <option value="bg-dark text-dark">Light</option>
              <option value="bg-light text-white">Dark</option>
              <option value="bg-danger text-white">Danger</option>
              <option value="bg-warning text-white">Warning</option>
              <option value="bg-info text-white">Info</option>
              <option value="bg-success text-white">Success</option>
            </select>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ComponentStyleSelector;
