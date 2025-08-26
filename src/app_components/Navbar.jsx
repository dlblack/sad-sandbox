import React, {useContext, useState} from "react";
import {StyleContext} from "../styles/StyleContext";
import logo from "../../assets/images/logo.png";
import { TextStore } from "../utils/TextStore";

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
                  {TextStore.interface("Navbar_File")}
                </a>
                <ul className="dropdown-menu">
                  <li><a className="dropdown-item" href="#">{TextStore.interface("Navbar_File_New")}</a></li>
                  <li><a className="dropdown-item" href="#">{TextStore.interface("Navbar_File_Open")}</a></li>
                  <li><a className="dropdown-item" href="#">{TextStore.interface("Navbar_File_Close")}</a></li>
                  <li><a className="dropdown-item" href="#">{TextStore.interface("Navbar_File_Save")}</a></li>
                  <li><a className="dropdown-item" href="#">{TextStore.interface("Navbar_File_Print")}</a></li>
                </ul>
              </li>

              {/* Maps Menu */}
              <li className="nav-item dropdown">
                <a className="nav-link dropdown-toggle" data-bs-toggle="dropdown" href="#">
                  {TextStore.interface("Navbar_Maps")}
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
                      {TextStore.interface("Navbar_Maps_Open")}
                    </a>
                  </li>
                </ul>
              </li>

              {/* Data Menu with Submenu */}
              <li className="nav-item dropdown">
                <a className="nav-link dropdown-toggle" data-bs-toggle="dropdown" href="#">
                  {TextStore.interface("Navbar_Data")}
                </a>
                <ul className="dropdown-menu">
                  {/* New Data Submenu */}
                  <li className="dropdown dropend">
                    <a
                      className="dropdown-item dropdown-toggle"
                      href="#"
                      data-bs-toggle="dropdown"
                    >
                      {TextStore.interface("Navbar_Data_NewData")}
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
                          {TextStore.interface("Navbar_Data_NewData_Manual")}
                        </a>
                      </li>
                      <li>
                        <a className="dropdown-item" href="#">
                          {TextStore.interface("Navbar_Data_NewData_ImportUSGS")}
                        </a>
                      </li>
                      <li>
                        <a className="dropdown-item" href="#">
                          {TextStore.interface("Navbar_Data_NewData_ImportDSS")}
                        </a>
                      </li>
                    </ul>
                  </li>

                  <li>
                    <a className="dropdown-item" href="#">{TextStore.interface("Navbar_Data_EditData")}</a>
                  </li>
                  <li>
                    <a className="dropdown-item" href="#">{TextStore.interface("Navbar_Data_DataUtilities")}</a>
                  </li>
                </ul>
              </li>

              {/* Analysis Menu */}
              <li className="nav-item dropdown">
                <a className="nav-link dropdown-toggle" data-bs-toggle="dropdown" href="#">
                  {TextStore.interface("Navbar_Analysis")}
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
                      {TextStore.interface("Navbar_Analysis_PeakFlowFrequency")}
                    </a>
                  </li>
                  <li>
                    <a
                      className="dropdown-item"
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        handleOpenComponent("Bulletin17AnalysisWizard");
                      }}
                    >
                      {TextStore.interface("Navbar_Analysis_Bulletin17")}
                    </a>
                  </li>
                  <li>
                    <a className="dropdown-item" href="#">
                      {TextStore.interface("Navbar_Analysis_GeneralFrequencyAnalysis")}
                    </a>
                  </li>
                  <li>
                    <a className="dropdown-item" href="#">
                      {TextStore.interface("Navbar_Analysis_VolumeFrequencyAnalysis")}
                    </a>
                  </li>
                  <li>
                    <a className="dropdown-item" href="#">
                      {TextStore.interface("Navbar_Analysis_CoincidentFrequencyAnalysis")}
                    </a>
                  </li>
                  <li>
                    <a className="dropdown-item" href="#">
                      {TextStore.interface("Navbar_Analysis_CurveCombinationAnalysis")}
                    </a>
                  </li>
                  <li>
                    <a className="dropdown-item" href="#">
                      {TextStore.interface("Navbar_Analysis_BalancedHydrographAnalysis")}
                    </a>
                  </li>
                  <li>
                    <a className="dropdown-item" href="#">
                      {TextStore.interface("Navbar_Analysis_DistributionFittingAnalysis")}
                    </a>
                  </li>
                  <li>
                    <a className="dropdown-item" href="#">
                      {TextStore.interface("Navbar_Analysis_MixedPopulationAnalysis")}
                    </a>
                  </li>
                  <li>
                    <a className="dropdown-item" href="#">
                      {TextStore.interface("Navbar_Analysis_CorrelationAnalysis")}
                    </a>
                  </li>
                  <li>
                    <a className="dropdown-item" href="#">
                      {TextStore.interface("Navbar_Analysis_RecordExtensionAnalysis")}
                    </a>
                  </li>
                  <li>
                    <a className="dropdown-item" href="#">
                      {TextStore.interface("Navbar_Analysis_PeaksOverThresholdAnalysis")}
                    </a>
                  </li>
                  <li>
                    <a className="dropdown-item" href="#">
                      {TextStore.interface("Navbar_Analysis_LinearRegression")}
                    </a>
                  </li>
                  <li>
                    <a className="dropdown-item" href="#">
                      {TextStore.interface("Navbar_Analysis_QuantileMapping")}
                    </a>
                  </li>
                  <li>
                    <a className="dropdown-item" href="#">
                      {TextStore.interface("Navbar_Analysis_CopulaAnalysis")}
                    </a>
                  </li>
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
                      {TextStore.interface("Navbar_Tools_Contents")}
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
                      {TextStore.interface("Navbar_Tools_Messages")}
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
                      {TextStore.interface("Navbar_Tools_StyleSelector")}
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
                  <li>
                    <a className="dropdown-item" href="#">
                      {TextStore.interface("Navbar_Help_UsersManual")}
                    </a>
                  </li>
                  <li>
                    <a className="dropdown-item" href="#">
                      {TextStore.interface("Navbar_Help_TutorialsAndGuides")}
                    </a>
                  </li>
                  <li>
                    <a className="dropdown-item" href="#">
                      {TextStore.interface("Navbar_Help_Examples")}
                    </a>
                  </li>
                  <li>
                    <a className="dropdown-item" href="#">
                      {TextStore.interface("Navbar_Help_Training")}
                    </a>
                  </li>
                  <li>
                    <hr className="dropdown-divider"/>
                  </li>
                  <li>
                    <a className="dropdown-item" href="#">
                      {TextStore.interface("Navbar_Help_InstallExampleData")}
                    </a>
                  </li>
                  <li>
                    <hr className="dropdown-divider"/>
                  </li>
                  <li>
                    <a className="dropdown-item" href="#">
                      {TextStore.interface("Navbar_Help_TermsAndConditions")}
                    </a>
                  </li>
                  <li>
                    <a className="dropdown-item" href="#">
                      {TextStore.interface("Navbar_Help_About")}
                    </a>
                  </li>
                </ul>
              </li>
            </ul>

            {/* Search Bar */}
            <form className="d-flex ms-3" role="search" style={{maxHeight: "2.8vh", minWidth: "45%"}}>
              <input
                className="form-control"
                type="search"
                placeholder={TextStore.interface("Navbar_Search_Placeholder")}
                aria-label="Search"/>
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
