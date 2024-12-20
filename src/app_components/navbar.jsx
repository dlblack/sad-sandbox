import React, { useContext, useState } from "react";
import { StyleContext } from "../styles/StyleContext";

function Navbar({
  toggleStandardToolbar,
  toggleClipboardToolbar,
  toggleMapsToolbar,
  toggleDssVueToolbar,
  isStandardToolbarDisplayed,
  isClipboardToolbarDisplayed,
  isMapsToolbarDisplayed,
  isDssVueToolbarDisplayed,
  addComponent,
}) {
  const { navbarStyle } = useContext(StyleContext);
  
  const [showMenu, setShowMenu] = useState(false);

  const menuClass = ["collapse navbar-collapse", showMenu ? "show" : ""].join(
    " "
  );

  const navbarClass = `navbar navbar-expand-lg ${navbarStyle || "bg-primary"}`;

  // Debugging helper for opening components
  const handleOpenComponent = (type) => {
    console.log(`[Navbar] Attempting to open: ${type}`);
    addComponent(type);
  };

  return (
    <nav className={navbarClass} style={{ zIndex: 2000 }}>
      <div className="container-fluid">
        HEC-SSP
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarColor01"
          aria-controls="navbarColor01"
          aria-expanded="false"
          aria-label="Toggle navigation"
          onClick={() => setShowMenu(!showMenu)}
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className={menuClass} id="navbarColor01">
          <ul className="navbar-nav me-auto">
            {/* Toolbar Menu */}
            <li className="nav-item dropdown">
              <a
                className="nav-link dropdown-toggle"
                data-bs-auto-close="outside"
                data-bs-toggle="dropdown"
                href="#"
                role="button"
                aria-haspopup="true"
                aria-expanded="false"
              >
                Tools
              </a>
              <div className="dropdown-menu">
                <div className="dropdown dropend">
                  <a
                    className="dropdown-item dropdown-toggle"
                    href="#"
                    role="button"
                    data-bs-toggle="dropdown"
                    aria-haspopup="true"
                    aria-expanded="false"
                  >
                    Toolbars
                  </a>
                  <div className="dropdown-menu">
                    <a
                      className="dropdown-item"
                      href="#"
                      onClick={toggleStandardToolbar}
                    >
                      Standard {isStandardToolbarDisplayed && "✓"}
                    </a>
                    <a
                      className="dropdown-item"
                      href="#"
                      onClick={toggleClipboardToolbar}
                    >
                      Clipboard {isClipboardToolbarDisplayed && "✓"}
                    </a>
                    <a
                      className="dropdown-item"
                      href="#"
                      onClick={toggleMapsToolbar}
                    >
                      Maps {isMapsToolbarDisplayed && "✓"}
                    </a>
                    <a
                      className="dropdown-item"
                      href="#"
                      onClick={toggleDssVueToolbar}
                    >
                      DssVue {isDssVueToolbarDisplayed && "✓"}
                    </a>
                  </div>
                </div>
              </div>
            </li>

            {/* Components Menu */}
            <li className="nav-item dropdown">
              <a
                className="nav-link dropdown-toggle"
                data-bs-toggle="dropdown"
                href="#"
                role="button"
                aria-haspopup="true"
                aria-expanded="false"
              >
                Components
              </a>
              <div className="dropdown-menu">
                <a
                  className="dropdown-item"
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    handleOpenComponent("Map");
                  }}
                >
                  Open Map Window
                </a>
                <a
                  className="dropdown-item"
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    handleOpenComponent("StyleSelector");
                  }}
                >
                  Open Style Selector
                </a>
              </div>
            </li>
            
            {/* Help Menu */}
            <li className="nav-item dropdown">
              <a
                className="nav-link dropdown-toggle"
                data-bs-toggle="dropdown"
                href="#"
                role="button"
                aria-haspopup="true"
                aria-expanded="false"
              >
                Help
              </a>
              <div className="dropdown-menu">
                <a
                  className="dropdown-item"
                  href="https://www.hec.usace.army.mil/confluence/sspdocs/sspum"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  User's Manual
                </a>
                <a
                  className="dropdown-item"
                  href="https://www.hec.usace.army.mil/confluence/sspdocs/ssptutorialsguides"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Tutorials and Guides
                </a>
                <a
                  className="dropdown-item"
                  href="https://www.hec.usace.army.mil/confluence/sspdocs/sspexamples/latest"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Examples
                </a>
                <a
                  className="dropdown-item"
                  href="https://www.hec.usace.army.mil/confluence/sspdocs/sspum"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Training
                </a>
                <div className="dropdown-divider"></div>
                <a className="dropdown-item" href="#">Install Example Data</a>
                <div className="dropdown-divider"></div>
                <a
                  className="dropdown-item"
                  href="https://www.hec.usace.army.mil/software/terms_and_conditions.aspx"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Terms and Conditions for Use
                </a>
                <a className="dropdown-item" href="#">About HEC-SSP</a>
              </div>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
