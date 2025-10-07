import React from "react";
import { TextStore } from "../utils/TextStore";
import { useUISizing } from "../uiSizing.jsx";
import {
  Card, Group, Stack, Text, SegmentedControl, Button, Slider, Divider, Box, useMantineColorScheme, useComputedColorScheme
} from "@mantine/core";

const DENSITY_PRESETS = [
  { label: TextStore.interface("ComponentInterfaceOptions_Density_Compact"), value: 0.9 },
  { label: TextStore.interface("ComponentInterfaceOptions_Density_Standard"), value: 1.0 },
  { label: TextStore.interface("ComponentInterfaceOptions_Density_Comfy"), value: 1.15 },
];

export default function ComponentInterfaceOptions() {
  const { colorScheme, setColorScheme } = useMantineColorScheme();
  const effective = useComputedColorScheme("light");

  const { scale, density, setScalePercent, setDensity, reset } = useUISizing();
  const currentPercent = Math.round(scale * 100);

  const densityName =
    density === 1
      ? TextStore.interface("ComponentInterfaceOptions_Density_Standard")
      : density < 1
        ? TextStore.interface("ComponentInterfaceOptions_Density_Compact")
        : TextStore.interface("ComponentInterfaceOptions_Density_Comfy");

  return (
    <Card
      withBorder
      radius="md"
      p={0}
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        minWidth: 0,
        minHeight: 0,
      }}
    >
      <div style={{ flex: 1, minHeight: 0, overflow: "auto" }}>
        <Box p="sm">
          <Stack gap="md">
            <Box>
              <Text fw={600} size="sm" mb={6}>
                {TextStore.interface("ComponentInterfaceOptions_ColorScheme")}
              </Text>
              <Group align="center" gap="sm" wrap="wrap">
                <SegmentedControl
                  size="xs"
                  value={colorScheme}
                  onChange={setColorScheme}
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
                  styles={{ markLabel: { marginTop: 6 } }}
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
          </Stack>
        </Box>
      </div>
    </Card>
  );
}
