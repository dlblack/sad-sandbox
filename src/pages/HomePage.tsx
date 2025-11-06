import React, { useRef } from "react";
import { Button, TextInput, Card, Group, Title, Tabs, Divider, Anchor, Stack, Text, Select } from "@mantine/core";
import useHomePage from "../hooks/useHomePage";
import TextStore from "../utils/TextStore";
import { IconFolderOpen } from "@tabler/icons-react";

function HomePage() {
    const {
        state: { projectName, directory, unitSystem, activeTab, recent },
        setProjectName,
        setDirectory,
        setUnitSystem,
        setActiveTab,
        canCreate,
        handleCreateProject,
        handleDirectorySelect,
        onDirectoryPickedFromInput,
        folderInputRef,
        handleOpenProject,
        onProjectFilePicked,
        openRecent,
    } = useHomePage();

    const projectFileInputRef = useRef<HTMLInputElement | null>(null);

    return (
        <div className="home-page-container">
            <Card padding="lg" radius="md" shadow="lg" style={{ width: 600 }}>
                <Title order={2} mb="lg">{TextStore.interface("HomePage_Title")}</Title>

                <Tabs value={activeTab} onChange={tab => setActiveTab(tab || "open")}>
                    <Tabs.List>
                        <Tabs.Tab value="new">{TextStore.interface("HomePage_CreateNewProject")}</Tabs.Tab>
                        <Tabs.Tab value="open">{TextStore.interface("HomePage_OpenExistingProject")}</Tabs.Tab>
                    </Tabs.List>

                    <Tabs.Panel value="new">
                        <TextInput
                            label={TextStore.interface("HomePage_CreateProject_Name_L")}
                            placeholder={TextStore.interface("HomePage_CreateProject_Name_P")}
                            value={projectName}
                            onChange={e => setProjectName(e.target.value)}
                            mb="lg"
                            required
                        />

                        <TextInput
                            label={TextStore.interface("HomePage_CreateProject_Directory_L")}
                            value={directory}
                            onChange={e => setDirectory(e.target.value)}
                            placeholder={TextStore.interface("HomePage_CreateProject_Directory_P")}
                            mb="lg"
                            required
                            rightSectionWidth={40}
                            rightSection={
                                <Button
                                    variant="outline"
                                    p={6}
                                    radius="sm"
                                    onClick={handleDirectorySelect}
                                >
                                    <IconFolderOpen size={18} />
                                </Button>
                            }
                        />

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
                            label={TextStore.interface("HomePage_CreateProject_UnitSystem_L")}
                            data={[
                                { value: "US", label: TextStore.interface("HomePage_CreateProject_UnitSystem_US") },
                                { value: "SI", label: TextStore.interface("HomePage_CreateProject_UnitSystem_SI") },
                            ]}
                            value={unitSystem}
                            onChange={val => setUnitSystem((val as "US" | "SI") || "US")}
                            mb="lg"
                            comboboxProps={{ withinPortal: true }}
                            allowDeselect={false}
                            checkIconPosition="right"
                        />

                        <Group grow>
                            <Button variant="filled" onClick={handleCreateProject} disabled={!canCreate}>
                                {TextStore.interface("HomePage_CreateProject_ButtonCreate")}
                            </Button>
                        </Group>
                    </Tabs.Panel>

                    <Tabs.Panel value="open">
                        <div style={{ width: "100%", display: "flex", justifyContent: "center", marginTop: 10 }}>
                            <Button
                                variant="outline"
                                onClick={() => handleOpenProject(projectFileInputRef.current)}
                                style={{ width: 260 }}
                            >
                                {TextStore.interface("HomePage_ButtonBrowseForProject")}
                            </Button>
                        </div>

                        <input
                            ref={projectFileInputRef}
                            type="file"
                            accept=".neptune,application/x-neptune"
                            onChange={onProjectFilePicked}
                            style={{ display: "none" }}
                            id="projectFileInput"
                        />

                        <Divider my="sm" />
                        <Text size="sm" c="dimmed" mb="xs">{TextStore.interface("HomePage_RecentProjects_L")}</Text>
                        {recent.length === 0 ? (
                            <Text size="sm" c="dimmed">{TextStore.interface("HomePage_NoRecentProjects")}</Text>
                        ) : (
                            <Stack gap="xs">
                                {recent.map((p, i) => (
                                    <Anchor
                                        key={`${p.projectName}-${i}`}
                                        onClick={() => openRecent(p)}
                                        style={{ cursor: "pointer", wordBreak: "break-all" }}
                                    >
                                        {p.projectName} {p.directory}
                                    </Anchor>
                                ))}
                            </Stack>
                        )}
                    </Tabs.Panel>
                </Tabs>
            </Card>
        </div>
    );
}

export default HomePage;
