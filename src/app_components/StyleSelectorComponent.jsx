import React, { useContext, useState } from "react";
import { StyleContext } from "../styles/StyleContext";

function StyleSelectorComponent() {
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
    <div className="card text-white bg-secondary mb-3" style={{ height: "100%" }}>
      <div className="card-body">
        <form>
          {/* Dropdown for App Background Styles */}
          <div className="form-group mt-3">
            <label htmlFor="appBackgroundStyleSelect">App Background Style</label>
            <select
              id="appBackgroundStyleSelect"
              className="form-control"
              value={selectedAppBackgroundStyle}
              onChange={handleAppBackgroundStyleChange}
            >
              <option value="bg-primary">Primary</option>
              <option value="bg-secondary">Secondary</option>
              <option value="bg-light">Light</option>
              <option value="bg-dark">Dark</option>
              <option value="bg-danger text-white">Danger</option>
              <option value="bg-warning text-white">Warning</option>
              <option value="bg-info text-white">Info</option>
              <option value="bg-success">Success</option>
            </select>
          </div>

          {/* Dropdown for Navbar Styles */}
          <div className="form-group mt-3">
            <label htmlFor="navbarStyleSelect">Navbar Style</label>
            <select
              id="navbarStyleSelect"
              className="form-control"
              value={selectedNavbarStyle}
              onChange={handleNavbarStyleChange}
            >
              <option value="bg-primary navbar-dark">Primary</option>
              <option value="bg-secondary navbar-dark">Secondary</option>
              <option value="bg-light navbar-light">Light</option>
              <option value="bg-dark navbar-dark">Dark</option>
            </select>
          </div>

          {/* Dropdown for Component Styles */}
          <div className="form-group mt-3">
            <label htmlFor="modalStyleSelect">Component Style</label>
            <select
              id="modalStyleSelect"
              className="form-control"
              value={selectedModalStyle}
              onChange={handleModalStyleChange}
            >
              <option value="bg-primary text-white">Primary</option>
              <option value="bg-secondary text-white">Secondary</option>
              <option value="bg-light text-dark">Light</option>
              <option value="bg-dark text-white">Dark</option>
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

export default StyleSelectorComponent;
