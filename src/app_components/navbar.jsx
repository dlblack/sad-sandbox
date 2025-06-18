import React, { useContext, useState } from "react";
import { StyleContext } from "../styles/StyleContext";
import avatarImage from "../assets/images/avatar.jpeg";
import logo from "../assets/images/logo.png"

function Navbar({
  addComponent,
}) {
  const { navbarStyle } = useContext(StyleContext);
  
  const [showMenu, setShowMenu] = useState(false);

  const menuClass = ["collapse navbar-collapse", showMenu ? "show" : ""].join(
    " "
  );

  const navbarClass = `navbar navbar-expand-lg ${navbarStyle || "bg-primary"}`;

  const handleOpenComponent = (type) => {
    console.log(`[Navbar] Attempting to open: ${type}`);
    addComponent(type);
  };

  const handleOpenImage = () => {
    window.open(avatarImage, "_blank");
  };

  return (
    <nav className={`${navbarClass} thin-navbar`}>
      <div className="container-fluid">
        <span className="navbar-brand text-light">
          <img src={logo} style={{ height: "24px", width: "24px"}}></img>
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
          <ul className="navbar-nav me-auto">

            {/* Left sideL main menus */}

            {/* File Menu */}
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
                <a
                  className="dropdown-item"
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    // TODO: Implement action to create new project
                  }}
                >
                  Create New...
                </a>
                
                <a
                  className="dropdown-item"
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    // TODO: Implement action to create open project
                  }}
                >
                  Open...
                </a>

                <a
                  className="dropdown-item"
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    // TODO: Implement action to close project
                  }}
                >
                  Close...
                </a>

                <a
                  className="dropdown-item"
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    // TODO: Implement action to save project
                  }}
                >
                  Save...
                </a>

                <a
                  className="dropdown-item"
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    // TODO: Implement action to print something
                  }}
                >
                  Print...
                </a>
              </div>
            </li>

            {/* Maps Menu */}
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
                <a
                  className="dropdown-item"
                  href="#"
                  // TODO
                >
                  Open Map Window
                </a>
              </div>
            </li>

            {/* Data Menu */}
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
                <a
                  className="dropdown-item"
                  href="#"
                  // TODO
                >
                  USGS
                </a>
                <a
                  className="dropdown-item"
                  href="#"
                  // TODO
                >
                  HEC-DSS
                </a>
                <a
                  className="dropdown-item"
                  href="#"
                  // TODO
                >
                  Data Utilities
                </a>
              </div>
            </li>

            {/* Analysis Menu */}
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
                <a
                  className="dropdown-item"
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    handleOpenComponent("Bulletin17AnalysisWizard");
                  }}
                >
                  New Bulletin 17 Analysis
                </a>
                <a
                  className="dropdown-item"
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    handleOpenComponent("GeneralFreqAnalysisWizard");
                  }}
                >
                  New General Frequency Analysis
                </a>
                <a
                  className="dropdown-item"
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    handleOpenComponent("VolumeFreqAnalysisWizard");
                  }}
                >
                  New Volume Frequency Analysis
                </a>
                <a
                  className="dropdown-item"
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    handleOpenComponent("CoincidentFreqAnalysisWizard");
                  }}
                >
                  New Coincident Frequency Analysis
                </a>
                <a
                  className="dropdown-item"
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    handleOpenComponent("CurveCombinationAnalysisWizard");
                  }}
                >
                  New Curve Combination Analysis
                </a>
                <a
                  className="dropdown-item"
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    handleOpenComponent("BalancedHydrographAnalysisWizard");
                  }}
                >
                  New Balanced Hydrograph Analysis
                </a>
                <a
                  className="dropdown-item"
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    handleOpenComponent("DistributionFittingAnalysisWizard");
                  }}
                >
                  New Distribution Fitting Analysis
                </a>
                <a
                  className="dropdown-item"
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    handleOpenComponent("MixedPopulationAnalysisWizard");
                  }}
                >
                  New Mixed Population Analysis
                </a>
                <a
                  className="dropdown-item"
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    handleOpenComponent("CorrelationAnalysisWizard");
                  }}
                >
                  New Correlation Analysis
                </a>
                <a
                  className="dropdown-item"
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    handleOpenComponent("RecordExtensionAnalysisWizard");
                  }}
                >
                  New Record Extension Analysis
                </a>
                <a
                  className="dropdown-item"
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    handleOpenComponent("PeaksOverThresholdAnalysisWizard");
                  }}
                >
                  New Peaks Over Threshold Analysis
                </a>
                <a
                  className="dropdown-item"
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    handleOpenComponent("LinearRegressionWizard");
                  }}
                >
                  New Linear Regression
                </a>
                <a
                  className="dropdown-item"
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    handleOpenComponent("QuantileMappingWizard");
                  }}
                >
                  New Quantile Mapping
                </a>
                <a
                  className="dropdown-item"
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    handleOpenComponent("CopulaAnalysisWizard");
                  }}
                >
                  New Copula Analysis
                </a>
              </div>
            </li>
          </ul>
          
          {/* Search bar */}
          <form className="d-flex mx-2" role="search" style={{ minWidth: "45%" }}>
            <input
              className="form-control"
              type="search"
              placeholder="Search"
              aria-label="Search"
              style={{ minWidth: "45%" }}
            />
            <button className="btn btn-outline-light ms-2" type="submit">
              <span className="material-icons" style={{ fontSize: 20 }}>search</span>
            </button>
          </form>


          {/* Right side: Tools and Help */}
          <ul className="navbar-nav ms-auto">

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
            <div className="dropdown-menu dropdown-menu-end">
              {/* Components submenu */}
              <div className="dropdown dropstart">
                <a
                  className="dropdown-item dropdown-toggle"
                  href="#"
                  role="button"
                  data-bs-toggle="dropdown"
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
              </div>
            </div>
          </li>

          {/* Help (?) icon */}
          <li className="nav-item dropdown">
            <a
              className="nav-link dropdown-toggle"
              data-bs-toggle="dropdown"
              href="#"
              role="button"
              aria-haspopup="true"
              aria-expanded="false"
            >
              <span className="material-icons" title="Help">help_outline</span>
            </a>
            <div className="dropdown-menu dropdown-menu-end">
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
                <a className="dropdown-item" href="#">About SAD</a>
              </div>
          </li>
          </ul>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
