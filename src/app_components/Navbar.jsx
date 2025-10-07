import React from "react";
import logo from "../../assets/images/logo.png";
import { TextStore } from "../utils/TextStore";
import {
  Flex,
  Group,
  Menu,
  Button,
  TextInput,
  ActionIcon,
  Divider,
  Box,
} from "@mantine/core";

const NAV_HEIGHT = 40;

function Navbar({ addComponent }) {

  const open = (type, optionalProps = {}) => addComponent(type, optionalProps);

  return (
    <nav
      className={`thin-navbar`}
      style={{
        height: NAV_HEIGHT,
        display: "flex",
        alignItems: "center",
        padding: "0 8px",
        width: "100%",
      }}
    >
      <Flex align="center" gap="sm" w="100%">
        {/* LEFT: brand + primary menus */}
        <Group gap="xs" style={{ flex: "0 0 auto" }} data-nav-left>
          <img src={logo} alt="logo" style={{ height: 24, width: 24 }} />

          {/* File */}
          <Menu>
            <Menu.Target>
              <Button size="xs" variant="subtle">{TextStore.interface("Navbar_File")}</Button>
            </Menu.Target>
            <Menu.Dropdown>
              <Menu.Item>{TextStore.interface("Navbar_File_New")}</Menu.Item>
              <Menu.Item>{TextStore.interface("Navbar_File_Open")}</Menu.Item>
              <Menu.Item>{TextStore.interface("Navbar_File_Close")}</Menu.Item>
              <Menu.Item>{TextStore.interface("Navbar_File_Save")}</Menu.Item>
              <Menu.Item>{TextStore.interface("Navbar_File_Print")}</Menu.Item>
            </Menu.Dropdown>
          </Menu>

          {/* Maps */}
          <Menu>
            <Menu.Target>
              <Button size="xs" variant="subtle">{TextStore.interface("Navbar_Maps")}</Button>
            </Menu.Target>
            <Menu.Dropdown>
              <Menu.Item onClick={() => open("ComponentMap")}>
                {TextStore.interface("Navbar_Maps_Open")}
              </Menu.Item>
            </Menu.Dropdown>
          </Menu>

          {/* Data */}
          <Menu>
            <Menu.Target>
              <Button size="xs" variant="subtle">{TextStore.interface("Navbar_Data")}</Button>
            </Menu.Target>
            <Menu.Dropdown>
              <Menu.Item onClick={() => open("ManualDataEntryEditor")}>
                {TextStore.interface("Navbar_Data_NewData_Manual")}
              </Menu.Item>
              <Menu.Item>{TextStore.interface("Navbar_Data_NewData_ImportUSGS")}</Menu.Item>
              <Menu.Item>{TextStore.interface("Navbar_Data_NewData_ImportDSS")}</Menu.Item>
              <Divider />
              <Menu.Item>{TextStore.interface("Navbar_Data_EditData")}</Menu.Item>
              <Menu.Item>{TextStore.interface("Navbar_Data_DataUtilities")}</Menu.Item>
            </Menu.Dropdown>
          </Menu>

          {/* Analysis */}
          <Menu>
            <Menu.Target>
              <Button size="xs" variant="subtle">{TextStore.interface("Navbar_Analysis")}</Button>
            </Menu.Target>
            <Menu.Dropdown>
              <Menu.Item onClick={() => open("Bulletin17AnalysisWizard")}>
                {TextStore.interface("Navbar_Analysis_Bulletin17")}
              </Menu.Item>
              <Menu.Item onClick={() => open("FloodTypeClassAnalysisWizard")}>
                {TextStore.interface("Navbar_Analysis_FloodTypeClass")}
              </Menu.Item>
              <Menu.Item onClick={() => open("PeakFlowFreqWizard")}>
                {TextStore.interface("Navbar_Analysis_PeakFlowFrequency")}
              </Menu.Item>
            </Menu.Dropdown>
          </Menu>
        </Group>

        {/* CENTER: search (stays centered because left and right are fixed) */}
        <Box style={{ flex: "1 1 0", display: "flex", justifyContent: "center" }} data-nav-center>
          <Box style={{ display: "flex", alignItems: "center", gap: 8, width: "min(520px, 100%)" }}>
            <TextInput
              size="xs"
              placeholder={TextStore.interface("Navbar_Search_Placeholder")}
              style={{ flex: 1, height: 28 }}
            />
            <ActionIcon size="sm" variant="light" aria-label="Search">
              <span className="material-icons">search</span>
            </ActionIcon>
          </Box>
        </Box>

        {/* RIGHT: tools/help */}
        <Group gap="xs" style={{ flex: "0 0 auto" }} data-nav-right>
          <Menu>
            <Menu.Target>
              <Button size="xs" variant="subtle">
                <span className="material-icons" title="Tools">settings</span>
              </Button>
            </Menu.Target>
            <Menu.Dropdown>
              <Menu.Item onClick={() => open("ComponentProject")}>
                {TextStore.interface("Navbar_Tools_Project")}
              </Menu.Item>
              <Menu.Item onClick={() => open("ComponentMessage")}>
                {TextStore.interface("Navbar_Tools_Messages")}
              </Menu.Item>
              <Divider />
              <Menu.Item onClick={() => open("ComponentInterfaceOptions")}>
                {TextStore.interface("Navbar_Tools_View_InterfaceSize")}
              </Menu.Item>
            </Menu.Dropdown>
          </Menu>

          <Menu position="bottom-end">
            <Menu.Target>
              <Button size="xs" variant="subtle">
                <span className="material-icons">help_outline</span>
              </Button>
            </Menu.Target>
            <Menu.Dropdown>
              <Menu.Item>{TextStore.interface("Navbar_Help_UsersManual")}</Menu.Item>
              <Menu.Item>{TextStore.interface("Navbar_Help_TutorialsAndGuides")}</Menu.Item>
              <Menu.Item>{TextStore.interface("Navbar_Help_Examples")}</Menu.Item>
              <Menu.Item
                component="a"
                href="https://www.hec.usace.army.mil/training/"
                target="_blank"
                rel="noopener noreferrer"
              >
                {TextStore.interface("Navbar_Help_Training")}
              </Menu.Item>
              <Divider />
              <Menu.Item>{TextStore.interface("Navbar_Help_InstallExampleData")}</Menu.Item>
              <Divider />
              <Menu.Item
                component="a"
                href="https://www.hec.usace.army.mil/software/terms_and_conditions.aspx"
                target="_blank"
                rel="noopener noreferrer"
              >
                {TextStore.interface("Navbar_Help_TermsAndConditions")}
              </Menu.Item>
              <Menu.Item>{TextStore.interface("Navbar_Help_About")}</Menu.Item>
              <Divider />
              <Menu.Item onClick={() => open("DemoPlots")}>Demo Plots (Plotly)</Menu.Item>
              <Menu.Item onClick={() => open("DemoPlotsRecharts")}>Demo Plots (Recharts)</Menu.Item>
            </Menu.Dropdown>
          </Menu>
        </Group>
      </Flex>
    </nav>
  );
}

export default Navbar;
