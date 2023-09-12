import { useState } from "react";

function Navbar({
  toggleStandardToolbar,
  toggleClipboardToolbar,
  toggleMapsToolbar,
  toggleDssVueToolbar,
}) {
  const [showMenu, setShowMenu] = useState(false);

  const menuClass = ["collapse navbar-collapse", showMenu ? "show" : ""].join(
    " "
  );

  return (
    <nav
      className="navbar navbar-expand-lg navbar-dark bg-primary"
      style={{ zIndex: 2000 }}
    >
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
          onClick={() => {
            setShowMenu(!showMenu);
          }}
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className={menuClass} id="navbarColor01">
          <ul className="navbar-nav me-auto">
            <li className="nav-item dropdown">
              <a
                className="nav-link dropdown-toggle"
                data-bs-toggle="dropdown"
                href="#"
                role="button"
                aria-haspopup="true"
                aria-expanded="false"
              >
                File
              </a>
              <div className="dropdown-menu">
                <a className="dropdown-item" href="#">
                  New Project
                </a>
                <a className="dropdown-item" href="#">
                  Open Project
                </a>
                <a className="dropdown-item" href="#">
                  Save Project
                </a>
                <a className="dropdown-item" href="#">
                  Save Project As...
                </a>
                <a className="dropdown-item" href="#">
                  Close Project
                </a>
                <div className="dropdown-divider"></div>
                <a className="dropdown-item" href="#">
                  Recent Projects
                </a>
              </div>
            </li>
            <li className="nav-item dropdown">
              <a
                className="nav-link dropdown-toggle"
                data-bs-toggle="dropdown"
                href="#"
                role="button"
                aria-haspopup="true"
                aria-expanded="false"
              >
                Edit
              </a>
              <div className="dropdown-menu">
                <a className="dropdown-item" href="#">
                  Cut
                </a>
                <a className="dropdown-item" href="#">
                  Copy
                </a>
                <a className="dropdown-item" href="#">
                  Paste
                </a>
              </div>
            </li>
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
                      Standard
                    </a>
                    <a
                      className="dropdown-item"
                      href="#"
                      onClick={toggleClipboardToolbar}
                    >
                      Clipboard
                    </a>
                    <a
                      className="dropdown-item"
                      href="#"
                      onClick={toggleMapsToolbar}
                    >
                      Maps
                    </a>
                    <a
                      className="dropdown-item"
                      href="#"
                      onClick={toggleDssVueToolbar}
                    >
                      DssVue
                    </a>
                  </div>
                </div>
                <a className="dropdown-item" href="#">
                  Another action
                </a>
                <a className="dropdown-item" href="#">
                  Something else here
                </a>
                <div className="dropdown-divider"></div>
                <a className="dropdown-item" href="#">
                  Separated link
                </a>
                <div className="dropdown-divider"></div>
              </div>
            </li>
            <li className="nav-item dropdown">
              <a
                className="nav-link dropdown-toggle"
                data-bs-toggle="dropdown"
                href="#"
                role="button"
                aria-haspopup="true"
                aria-expanded="false"
              >
                Maps
              </a>
              <div className="dropdown-menu">
                <a className="dropdown-item" href="#">
                  Action
                </a>
                <a className="dropdown-item" href="#">
                  Another action
                </a>
                <a className="dropdown-item" href="#">
                  Something else here
                </a>
                <div className="dropdown-divider"></div>
                <a className="dropdown-item" href="#">
                  Separated link
                </a>
              </div>
            </li>
            <li className="nav-item dropdown">
              <a
                className="nav-link dropdown-toggle"
                data-bs-toggle="dropdown"
                href="#"
                role="button"
                aria-haspopup="true"
                aria-expanded="false"
              >
                Data
              </a>
              <div className="dropdown-menu">
                <a className="dropdown-item" href="#">
                  Action
                </a>
                <a className="dropdown-item" href="#">
                  Another action
                </a>
                <a className="dropdown-item" href="#">
                  Something else here
                </a>
                <div className="dropdown-divider"></div>
                <a className="dropdown-item" href="#">
                  Separated link
                </a>
              </div>
            </li>
            <li className="nav-item dropdown">
              <a
                className="nav-link dropdown-toggle"
                data-bs-toggle="dropdown"
                href="#"
                role="button"
                aria-haspopup="true"
                aria-expanded="false"
              >
                Analysis
              </a>
              <div className="dropdown-menu">
                <a className="dropdown-item" href="#">
                  Action
                </a>
                <a className="dropdown-item" href="#">
                  Another action
                </a>
                <a className="dropdown-item" href="#">
                  Something else here
                </a>
                <div className="dropdown-divider"></div>
                <a className="dropdown-item" href="#">
                  Separated link
                </a>
              </div>
            </li>
            <li className="nav-item dropdown">
              <a
                className="nav-link dropdown-toggle"
                data-bs-toggle="dropdown"
                href="#"
                role="button"
                aria-haspopup="true"
                aria-expanded="false"
              >
                Results
              </a>
              <div className="dropdown-menu">
                <a className="dropdown-item" href="#">
                  Graph
                </a>
                <a className="dropdown-item" href="#">
                  Data
                </a>
                <a className="dropdown-item" href="#">
                  Results
                </a>
                <a className="dropdown-item" href="#">
                  Summary Report
                </a>
                <div className="dropdown-divider"></div>
                <a className="dropdown-item" href="#">
                  Default Plot Line Styles
                </a>
              </div>
            </li>
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
                <a className="dropdown-item" href="#">
                  Another action
                </a>
                <a className="dropdown-item" href="#">
                  Something else here
                </a>
                <div className="dropdown-divider"></div>
                <a className="dropdown-item" href="#">
                  Separated link
                </a>
              </div>
            </li>
            <li className="nav-item dropdown">
              <a
                className="nav-link dropdown-toggle"
                data-bs-toggle="dropdown"
                href="#"
                role="button"
                aria-haspopup="true"
                aria-expanded="false"
              >
                Window
              </a>
              <div className="dropdown-menu">
                <a className="dropdown-item" href="#">
                  Action
                </a>
                <a className="dropdown-item" href="#">
                  Another action
                </a>
                <a className="dropdown-item" href="#">
                  Something else here
                </a>
                <div className="dropdown-divider"></div>
                <a className="dropdown-item" href="#">
                  Separated link
                </a>
              </div>
            </li>
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
                <a className="dropdown-item" href="#">
                  Install Example Data
                </a>
                <div className="dropdown-divider"></div>
                <a
                  className="dropdown-item"
                  href="https://www.hec.usace.army.mil/software/terms_and_conditions.aspx"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Terms and Conditions for Use
                </a>
                <a className="dropdown-item" href="#">
                  About HEC-SSP
                </a>
              </div>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
