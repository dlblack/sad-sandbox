import React, { useRef, useState, useEffect, useMemo } from "react";
import logo from "../../assets/images/logo.png";
import { TextStore } from "../utils/TextStore";
import { Flex, Group, Menu, Button, TextInput, ActionIcon, Divider, Box, Modal, Select, Anchor, Stack, } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { IconFolderOpen } from "@tabler/icons-react";
import { useNavigate } from "react-router-dom";
import { closeProjectSession } from "../utils/projectSession";
import useAppData from "../hooks/useAppData";
import useProjectOpener from "../hooks/useProjectOpener";
import { fetchRecent, type RecentProject } from "../api/recentProjects";
import useFolderPicker from "../hooks/useFolderPicker";
import useNeptuneProjectPicker from "../hooks/useNeptuneProjectPicker";

const NAV_HEIGHT = 40;
type UnitSystem = "US" | "SI";

interface NavbarProps {
  addComponent: (type: string, optionalProps?: any) => void;
}

function Navbar({ addComponent }: NavbarProps) {
  const openComponent = (
      type: string, optionalProps: any = {}) => addComponent(type, optionalProps
  );

  const [openedNew, newCtrls] = useDisclosure(false);
  const [openedOpen, openCtrls] = useDisclosure(false);

  const [projectName, setProjectName] = useState("");
  const [projectDirectory, setProjectDirectory] = useState("");
  const [unitSystem, setUnitSystem] = useState<UnitSystem>("US");

  const [recent, setRecent] = useState<RecentProject[]>([]);
  const navigate = useNavigate();
  const { clearAll } = useAppData();

  useEffect(() => {
    fetchRecent().then(setRecent);
  }, []);

  const canCreate = useMemo(() => projectName.trim() && projectDirectory.trim(), [projectName, projectDirectory]);
  const bumpAndNavigate = useProjectOpener(setRecent);

  const { browse: handleBrowseFolder, fallbackRef: folderInputRef, onFallbackChange: onDirectoryPickedFromInput } =
      useFolderPicker(setProjectDirectory);

  const { browseProjectFile, onPickedFromInput } =
      useNeptuneProjectPicker(bumpAndNavigate);

  const projectFileInputRef = useRef<HTMLInputElement | null>(null);

  const handleCreateProject = async () => {
    if (!canCreate) {
      alert(TextStore.interface("Navbar_File_New_RequireNameDir"));
      return;
    }
    try {
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectName,
          directory: projectDirectory,
          unitSystem,
          created_at: new Date().toISOString(),
          last_modified: new Date().toISOString(),
        }),
      });
      const data = await res.json();
      if (data?.success) {
        const meta = { projectName, directory: data.directory as string };
        await bumpAndNavigate(meta);
        newCtrls.close();
      } else {
        alert(data?.error);
      }
    } catch {
      alert("Failed to create project");
    }
  };

  const handleCloseProject = () => {
    clearAll();
    closeProjectSession();
    navigate("/");
  };

  return (
      <nav
          className="thin-navbar"
          style={{
            height: NAV_HEIGHT,
            display: "flex",
            alignItems: "center",
            padding: "0 8px",
            width: "100%",
          }}
      >
        <Flex align="center" gap="sm" w="100%">
          <Group gap="xs" style={{ flex: "0 0 auto" }} data-nav-left>
            <img src={logo} alt="logo" style={{ height: 24, width: 24 }} />

            <Menu>
              <Menu.Target>
                <Button size="xs" variant="subtle">
                  {TextStore.interface("Navbar_File")}
                </Button>
              </Menu.Target>
              <Menu.Dropdown>
                <Menu.Item onClick={newCtrls.open}>{TextStore.interface("Navbar_File_New")}</Menu.Item>
                <Menu.Item onClick={openCtrls.open}>{TextStore.interface("Navbar_File_Open")}</Menu.Item>
                <Menu.Item onClick={handleCloseProject}>{TextStore.interface("Navbar_File_Close")}</Menu.Item>
                <Menu.Item>{TextStore.interface("Navbar_File_Save")}</Menu.Item>
              </Menu.Dropdown>
            </Menu>

            <Menu>
              <Menu.Target>
                <Button size="xs" variant="subtle">
                  {TextStore.interface("Navbar_Maps")}
                </Button>
              </Menu.Target>
              <Menu.Dropdown>
                <Menu.Item onClick={() => openComponent("ComponentMap")}>
                  {TextStore.interface("Navbar_Maps_Open")}
                </Menu.Item>
              </Menu.Dropdown>
            </Menu>

            <Menu>
              <Menu.Target>
                <Button size="xs" variant="subtle">
                  {TextStore.interface("Navbar_Data")}
                </Button>
              </Menu.Target>
              <Menu.Dropdown>
                <Menu
                    trigger="hover"
                    openDelay={80}
                    closeDelay={120}
                    position="right-start"
                >
                  <Menu.Target>
                    <Menu.Item
                        rightSection={<span className="material-icons" style={{ fontSize: 16 }}>chevron_right</span>}
                    >
                      {TextStore.interface("Navbar_Data_NewData")}
                    </Menu.Item>
                  </Menu.Target>

                  <Menu.Dropdown>
                    <Menu.Item onClick={() => openComponent("ManualDataEntryEditor")}>
                      {TextStore.interface("Navbar_Data_NewData_Manual")}
                    </Menu.Item>
                    <Menu.Item>{TextStore.interface("Navbar_Data_NewData_ImportUSGS")}</Menu.Item>
                    <Menu.Item>{TextStore.interface("Navbar_Data_NewData_ImportDSS")}</Menu.Item>
                  </Menu.Dropdown>
                </Menu>
                <Divider />
                <Menu.Item>{TextStore.interface("Navbar_Data_EditData")}</Menu.Item>
                <Menu.Item>{TextStore.interface("Navbar_Data_DataUtilities")}</Menu.Item>
              </Menu.Dropdown>
            </Menu>

            <Menu>
              <Menu.Target>
                <Button size="xs" variant="subtle">
                  {TextStore.interface("Navbar_Analysis")}
                </Button>
              </Menu.Target>
              <Menu.Dropdown>
                <Menu.Item onClick={() => openComponent("Bulletin17AnalysisWizard")}>
                  {TextStore.interface("Navbar_Analysis_Bulletin17")}
                </Menu.Item>
                <Menu.Item onClick={() => openComponent("FloodTypeClassAnalysisWizard")}>
                  {TextStore.interface("Navbar_Analysis_FloodTypeClass")}
                </Menu.Item>
                <Menu.Item onClick={() => openComponent("PeakFlowFreqWizard")}>
                  {TextStore.interface("Navbar_Analysis_PeakFlowFrequency")}
                </Menu.Item>
              </Menu.Dropdown>
            </Menu>
          </Group>

          <Box style={{ flex: "1 1 0", display: "flex", justifyContent: "center" }} data-nav-center>
            <Box
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  width: "min(520px, 100%)",
                }}
            >
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

          <Group gap="xs" style={{ flex: "0 0 auto" }} data-nav-right>
            <Menu>
              <Menu.Target>
                <Button size="xs" variant="subtle">
                  <span className="material-icons" title="Tools">settings</span>
                </Button>
              </Menu.Target>
              <Menu.Dropdown>
                <Menu.Item onClick={() => openComponent("ComponentProject")}>
                  {TextStore.interface("Navbar_Tools_Project")}
                </Menu.Item>
                <Menu.Item onClick={() => openComponent("ComponentMessage")}>
                  {TextStore.interface("Navbar_Tools_Messages")}
                </Menu.Item>
                <Divider />
                <Menu.Item onClick={() => openComponent("ComponentInterfaceOptions")}>
                  {TextStore.interface("Navbar_Tools_View_InterfaceSize")}
                </Menu.Item>
                <Menu.Item onClick={() => openComponent("ComponentPlotStyle")}>
                  {TextStore.interface("Navbar_Tools_View_PlotStyle")}
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
                <Menu.Item onClick={() => openComponent("DemoPlots")}>Demo Plots (Plotly)</Menu.Item>
                <Menu.Item onClick={() => openComponent("DemoPlotsRecharts")}>Demo Plots (Recharts)</Menu.Item>
              </Menu.Dropdown>
            </Menu>
          </Group>
        </Flex>

        <Modal opened={openedNew} onClose={newCtrls.close} title={TextStore.interface("Navbar_File_New_L")}>
          <TextInput
              label={TextStore.interface("Navbar_File_New_ProjectName")}
              placeholder={TextStore.interface("Navbar_File_New_ProjectName_D")}
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
          />

          <Group mt="md" align="flex-end">
            <TextInput
                label={TextStore.interface("Navbar_File_New_DirectoryLocation")}
                placeholder={TextStore.interface("Navbar_File_New_DirectoryLocation_D")}
                value={projectDirectory}
                onChange={(e) => setProjectDirectory(e.currentTarget.value)}
                style={{ flex: 1 }}
            />
            <Button onClick={handleBrowseFolder} variant="outline" p={6} radius="sm" aria-label="Browse folder">
              <IconFolderOpen size={18} />
            </Button>
          </Group>

          <input
              ref={folderInputRef}
              type="file"
              webkitdirectory=""
              directory=""
              multiple
              onChange={onDirectoryPickedFromInput}
              style={{ display: "none" }}
          />

          <Select
              mt="md"
              label={TextStore.interface("Navbar_File_New_UnitSystem")}
              data={[
                { value: "US", label: "U.S. Customary" },
                { value: "SI", label: "SI" },
              ]}
              value={unitSystem}
              onChange={(v) => setUnitSystem((v as UnitSystem) || "US")}
              allowDeselect={false}
              checkIconPosition="right"
          />

          <Group mt="md">
            <Button onClick={handleCreateProject}>Create</Button>
            <Button variant="outline" onClick={newCtrls.close}>Cancel</Button>
          </Group>
        </Modal>

        <Modal opened={openedOpen} onClose={openCtrls.close} title={TextStore.interface("Navbar_File_Open")}>
          <div style={{ width: "100%", display: "flex", justifyContent: "center", marginTop: 8, marginBottom: 8 }}>
            <Button
                variant="outline"
                onClick={async () => {
                  const ok = await browseProjectFile();
                  if (ok) openCtrls.close();
                  if (ok === null) projectFileInputRef.current?.click();
                }}
                style={{ width: 260 }}
            >
              {TextStore.interface("HomePage_ButtonBrowseForProject")}
            </Button>
          </div>

          <input
              ref={projectFileInputRef}
              type="file"
              accept=".neptune,application/x-neptune"
              onChange={async (e) => {
                const ok = await onPickedFromInput(e);
                if (ok) openCtrls.close();
              }}
              style={{ display: "none" }}
          />

          <Divider my="sm" />
          <div style={{ marginBottom: 6, fontSize: 14, color: "var(--mantine-color-dimmed)" }}>
            {TextStore.interface("HomePage_RecentProjects_L")}
          </div>

          {recent.length === 0 ? (
              <div style={{ fontSize: 14, color: "var(--mantine-color-dimmed)" }}>
                {TextStore.interface("HomePage_NoRecentProjects")}
              </div>
          ) : (
              <Stack gap="xs">
                {recent.map((p, i) => (
                    <Anchor
                        key={`${p.projectName}-${i}`}
                        onClick={async () => {
                          await bumpAndNavigate(p);
                          openCtrls.close();
                        }}
                        style={{ cursor: "pointer", wordBreak: "break-all" }}
                    >
                      {p.projectName} {p.directory}
                    </Anchor>
                ))}
              </Stack>
          )}
        </Modal>
      </nav>
  );
}

export default Navbar;
