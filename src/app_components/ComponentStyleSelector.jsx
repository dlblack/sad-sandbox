import React, { useContext, useState } from "react";
import { StyleContext } from "../styles/StyleContext";

function ComponentStyleSelector() {
  const {
    modalStyle,
    navbarStyle,
    appBackgroundStyle,
    toggleModalStyle,
    toggleNavbarStyle,
    toggleAppBackgroundStyle,
  } = useContext(StyleContext);

  const [selectedModalStyle, setSelectedModalStyle] = useState(modalStyle);
  const [selectedNavbarStyle, setSelectedNavbarStyle] = useState(navbarStyle);
  const [selectedAppBackgroundStyle, setSelectedAppBackgroundStyle] = useState(appBackgroundStyle);

  const handleModalStyleChange = (event) => {
    const newStyle = event.target.value;
    setSelectedModalStyle(newStyle);
    toggleModalStyle(newStyle);
  };

  const handleNavbarStyleChange = (event) => {
    const newStyle = event.target.value;
    setSelectedNavbarStyle(newStyle);
    toggleNavbarStyle(newStyle);
  };

  const handleAppBackgroundStyleChange = (event) => {
    const newStyle = event.target.value;
    setSelectedAppBackgroundStyle(newStyle);
    toggleAppBackgroundStyle(newStyle);
  };

  return (
    <div className="card text-white mb-2">
      <div className="card-body p-2">
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
            <label htmlFor="modalStyleSelect" className="style-selector-label">
              Component Style
            </label>
            <select
              id="modalStyleSelect"
              className="form-control form-control-sm style-selector-compact flex-grow-1"
              value={selectedModalStyle}
              onChange={handleModalStyleChange}
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
