import React, { JSX, useEffect, useState } from "react";
import { TextStore } from "../utils/TextStore";
import { useUISizing } from "../uiSizing";
import {
  Card,
  Group,
  Stack,
  Text,
  SegmentedControl,
  Button,
  Slider,
  Divider,
  Box,
  useMantineColorScheme,
  useComputedColorScheme,
  MantineColorScheme,
  TextInput,
  Switch,
} from "@mantine/core";
import {
  getSuppressBrowserContextMenu,
  setSuppressBrowserContextMenu,
} from "../hooks/useContextMenuSuppression";

type DensityPreset = { label: string; value: number };

type UISizing = {
  scale: number;
  density: number;
  setScalePercent: (v: number) => void;
  setDensity: (v: number) => void;
  reset: () => void;
};

const DENSITY_PRESETS: DensityPreset[] = [
  { label: TextStore.interface("ComponentInterfaceOptions_Density_Compact"), value: 0.9 },
  { label: TextStore.interface("ComponentInterfaceOptions_Density_Standard"), value: 1.0 },
  { label: TextStore.interface("ComponentInterfaceOptions_Density_Comfy"), value: 1.15 },
];

export default function ComponentInterfaceOptions(): JSX.Element {
  const { colorScheme, setColorScheme } = useMantineColorScheme();
  const effective = useComputedColorScheme("light");

  const { scale, density, setScalePercent, setDensity, reset } = useUISizing() as UISizing;

  const [defaultProjectRoot, setDefaultProjectRoot] = useState("");
  const [savingRoot, setSavingRoot] = useState(false);
  const [suppressContextMenu, setSuppressContextMenu] = useState(getSuppressBrowserContextMenu());

  useEffect(() => {
    let cancelled = false;
    fetch("/api/config")
      .then((r) => r.json())
      .then((cfg) => {
        if (!cancelled && cfg && typeof cfg.projectsRoot === "string") {
          setDefaultProjectRoot(cfg.projectsRoot);
        }
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  const currentPercent = Math.round(scale * 100);

  const densityName =
    density === 1
      ? TextStore.interface("ComponentInterfaceOptions_Density_Standard")
      : density < 1
        ? TextStore.interface("ComponentInterfaceOptions_Density_Compact")
        : TextStore.interface("ComponentInterfaceOptions_Density_Comfy");

  const handleSchemeChange = (v: string) => {
    setColorScheme(v as MantineColorScheme);
  };

  const handleSaveRoot = () => {
    const trimmed = defaultProjectRoot.trim();
    if (!trimmed) {
      return;
    }
    setSavingRoot(true);
    fetch("/api/config", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ projectsRoot: trimmed }),
    })
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((cfg) => {
        if (cfg && typeof cfg.projectsRoot === "string") {
          setDefaultProjectRoot(cfg.projectsRoot);
        }
      })
      .catch(() => {})
      .finally(() => {
        setSavingRoot(false);
      });
  };

  const handleSuppressContextMenuChange = (checked: boolean) => {
    setSuppressContextMenu(checked);
    setSuppressBrowserContextMenu(checked);
    // Reload the page to apply the change
    window.location.reload();
  };

  return (
    <Card withBorder radius="md" p={0}>
      <Box p="sm">
        <Stack gap="md">
          <Box>
            <Text fw={800} size="sm" mb={6}>
              {TextStore.interface("ComponentInterfaceOptions_InterfaceOptions_Label")}
            </Text>
            <Text fw={600} size="sm" mb={6}>
              {TextStore.interface("ComponentInterfaceOptions_ColorScheme")}
            </Text>
            <Group align="center" gap="sm" wrap="wrap">
              <SegmentedControl
                size="xs"
                value={colorScheme}
                onChange={handleSchemeChange}
                data={[
                  { label: TextStore.interface("ComponentInterfaceOptions_StyleOption_Auto"), value: "auto" },
                  { label: TextStore.interface("ComponentInterfaceOptions_StyleOption_Light"), value: "light" },
                  { label: TextStore.interface("ComponentInterfaceOptions_StyleOption_Dark"), value: "dark" },
                ]}
              />
              <Text size="xs" c="dimmed">
                {TextStore.interface("ComponentInterfaceOptions_CurrentScheme")} {effective}
              </Text>
            </Group>
          </Box>

          <Divider />

          <Box>
            <Text fw={600} size="sm" mb="xs">
              {TextStore.interface("ComponentInterfaceOptions_HeaderPrefix")} {currentPercent}% · {densityName}
            </Text>

            <Box pr={10} mb={40}>
              <Slider
                min={60}
                max={150}
                step={5}
                value={currentPercent}
                onChange={setScalePercent}
                aria-label={TextStore.interface("ComponentInterfaceOptions_Slider_Aria")}
                marks={[
                  { value: 60, label: "60%" },
                  { value: 100, label: "100%" },
                  { value: 150, label: "150%" },
                ]}
              />
            </Box>

            <Group justify="flex-end" mt={14}>
              <Button
                variant="outline"
                size="xs"
                color="yellow"
                onClick={reset}
                title={TextStore.interface("ComponentInterfaceOptions_ResetTitle")}
              >
                {TextStore.interface("ComponentInterfaceOptions_ResetButton")}
              </Button>
            </Group>
          </Box>

          <Box>
            <Text fw={600} size="sm" mb={6}>
              {TextStore.interface("ComponentInterfaceOptions_Density")}
            </Text>
            <SegmentedControl
              size="xs"
              value={String(density)}
              onChange={(v) => setDensity(Number(v))}
              data={DENSITY_PRESETS.map(({ label, value }) => ({ label, value: String(value) }))}
            />
          </Box>

          <Divider />

          <Box>
            <Switch
              checked={suppressContextMenu}
              onChange={(e) => handleSuppressContextMenuChange(e.currentTarget.checked)}
              label={
                <Box>
                  <Text size="sm" fw={600}>
                    {TextStore.interface("ComponentInterfaceOptions_SuppressContextMenu_Label")}
                  </Text>
                  <Text size="xs" c="dimmed">
                    {TextStore.interface("ComponentInterfaceOptions_SuppressContextMenu_Description")}
                  </Text>
                </Box>
              }
            />
          </Box>

          <Divider />

          <Box>
            <Text fw={800} size="sm" mb={6}>
              {TextStore.interface("ComponentInterfaceOptions_DefaultProjectRoot_Label")}
            </Text>
            <TextInput
              size="xs"
              value={defaultProjectRoot}
              onChange={(e) => setDefaultProjectRoot(e.currentTarget.value)}
            />
            <Group justify="flex-end" mt="xs">
              <Button
                size="xs"
                variant="outline"
                onClick={handleSaveRoot}
                loading={savingRoot}
              >
                {TextStore.interface("ComponentInterfaceOptions_DefaultProjectRoot_Save_Button")}
              </Button>
            </Group>
          </Box>
        </Stack>
      </Box>
    </Card>
  );
}
