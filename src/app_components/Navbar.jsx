import React, {useContext, useState} from "react";
import {StyleContext} from "../styles/StyleContext";
import logo from "../../assets/images/logo.png";

function Navbar({addComponent}) {
  const {navbarStyle} = useContext(StyleContext);
  const [showMenu, setShowMenu] = useState(false);

  const menuClass = ["collapse navbar-collapse", showMenu ? "show" : ""].join(" ");
  const navbarClass = `navbar navbar-expand-lg ${navbarStyle || "bg-primary"}`;

  const handleOpenComponent = (type, optionalProps = {}) => {
    addComponent(type, optionalProps);
  };

  return (
    <nav className={`${navbarClass} thin-navbar`}>
      <div className="container-fluid">
        <span className="navbar-brand text-light">
          <img src={logo} style={{height: "24px", width: "24px"}} alt="logo"/>
        </span>
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
          <div className="d-flex align-items-center">
            <ul className="navbar-nav">

              {/* File Menu */}
              <li className="nav-item dropdown">
                <a className="nav-link dropdown-toggle" data-bs-toggle="dropdown" href="#">
                  File
                </a>
                <ul className="dropdown-menu">
                  <li><a className="dropdown-item" href="#">Create New...</a></li>
                  <li><a className="dropdown-item" href="#">Open...</a></li>
                  <li><a className="dropdown-item" href="#">Close...</a></li>
                  <li><a className="dropdown-item" href="#">Save...</a></li>
                  <li><a className="dropdown-item" href="#">Print...</a></li>
                </ul>
              </li>

              {/* Maps Menu */}
              <li className="nav-item dropdown">
                <a className="nav-link dropdown-toggle" data-bs-toggle="dropdown" href="#">
                  Maps
                </a>
                <ul className="dropdown-menu">
                  <li>
                    <a
                      className="dropdown-item"
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        handleOpenComponent("ComponentMap");
                      }}
                    >
                      Open Map Window
                    </a>
                  </li>
                </ul>
              </li>

              {/* Data Menu with Submenu */}
              <li className="nav-item dropdown">
                <a className="nav-link dropdown-toggle" data-bs-toggle="dropdown" href="#">
                  Data
                </a>
                <ul className="dropdown-menu">
                  {/* New Data Submenu */}
                  <li className="dropdown dropend">
                    <a
                      className="dropdown-item dropdown-toggle"
                      href="#"
                      data-bs-toggle="dropdown"
                    >
                      New Data
                    </a>
                    <ul className="dropdown-menu">
                      <li>
                        <a
                          className="dropdown-item"
                          href="#"
                          onClick={(e) => {
                            e.preventDefault();
                            handleOpenComponent("ManualDataEntryEditor");
                          }}
                        >
                          Manual Data Entry
                        </a>
                      </li>
                      <li><a className="dropdown-item" href="#">Import from USGS</a></li>
                      <li><a className="dropdown-item" href="#">Import from HEC-DSS</a></li>
                    </ul>
                  </li>

                  <li><a className="dropdown-item" href="#">Edit Data</a></li>
                  <li><a className="dropdown-item" href="#">Data Utilities</a></li>
                </ul>
              </li>

              {/* Analysis Menu */}
              <li className="nav-item dropdown">
                <a className="nav-link dropdown-toggle" data-bs-toggle="dropdown" href="#">
                  Analysis
                </a>
                <ul className="dropdown-menu">
                  <li>
                    <a
                      className="dropdown-item"
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        handleOpenComponent("PeakFlowFreqWizard");
                      }}
                    >
                      New Peak Flow Frequency
                    </a>
                  </li>
                  <li><a
                    className="dropdown-item"
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      handleOpenComponent("Bulletin17AnalysisWizard");
                    }}
                  >New Bulletin 17 Analysis</a></li>
                  <li><a className="dropdown-item" href="#">New General Frequency Analysis</a></li>
                  <li><a className="dropdown-item" href="#">New Volume Frequency Analysis</a></li>
                  <li><a className="dropdown-item" href="#">New Coincident Frequency Analysis</a></li>
                  <li><a className="dropdown-item" href="#">New Curve Combination Analysis</a></li>
                  <li><a className="dropdown-item" href="#">New Balanced Hydrograph Analysis</a></li>
                  <li><a className="dropdown-item" href="#">New Distribution Fitting Analysis</a></li>
                  <li><a className="dropdown-item" href="#">New Mixed Population Analysis</a></li>
                  <li><a className="dropdown-item" href="#">New Correlation Analysis</a></li>
                  <li><a className="dropdown-item" href="#">New Record Extension Analysis</a></li>
                  <li><a className="dropdown-item" href="#">New Peaks Over Threshold Analysis</a></li>
                  <li><a className="dropdown-item" href="#">New Linear Regression</a></li>
                  <li><a className="dropdown-item" href="#">New Quantile Mapping</a></li>
                  <li><a className="dropdown-item" href="#">New Copula Analysis</a></li>
                </ul>
              </li>

              {/* Tools (gear icon) */}
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
                  <span className="material-icons" title="Tools">settings</span>
                </a>
                <ul className="dropdown-menu">
                  <li>
                    <a
                      className="dropdown-item"
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        handleOpenComponent("ComponentContent");
                      }}
                    >
                      Contents
                    </a>
                  </li>
                  <li>
                    <a
                      className="dropdown-item"
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        handleOpenComponent("ComponentMessage");
                      }}
                    >
                      Messages
                    </a>
                  </li>
                  <li>
                    <a
                      className="dropdown-item"
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        handleOpenComponent("ComponentStyleSelector");
                      }}
                    >
                      Style Selector
                    </a>
                  </li>
                </ul>
              </li>

              {/* Help Menu */}
              <li className="nav-item dropdown">
                <a className="nav-link dropdown-toggle" data-bs-toggle="dropdown" href="#">
                  <span className="material-icons">help_outline</span>
                </a>
                <ul className="dropdown-menu dropdown-menu-end">
                  <li><a className="dropdown-item" href="#">User's Manual</a></li>
                  <li><a className="dropdown-item" href="#">Tutorials and Guides</a></li>
                  <li><a className="dropdown-item" href="#">Examples</a></li>
                  <li><a className="dropdown-item" href="#">Training</a></li>
                  <li>
                    <hr className="dropdown-divider"/>
                  </li>
                  <li><a className="dropdown-item" href="#">Install Example Data</a></li>
                  <li>
                    <hr className="dropdown-divider"/>
                  </li>
                  <li><a className="dropdown-item" href="#">Terms and Conditions</a></li>
                  <li><a className="dropdown-item" href="#">About HEC-Neptune</a></li>
                </ul>
              </li>
            </ul>

            {/* Search Bar */}
            <form className="d-flex ms-3" role="search" style={{maxHeight: "2.8vh", minWidth: "45%"}}>
              <input className="form-control" type="search" placeholder="Search" aria-label="Search"/>
              <button className="btn btn-outline-light ms-2 d-flex align-items-center justify-content-center"
                      type="submit">
                <span className="material-icons">search</span>
              </button>
            </form>
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
