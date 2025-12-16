import React, { JSX, useEffect, useMemo, useState } from "react";
import type { Dash } from "plotly.js";
import {
  Card, Group, Stack, Text, SegmentedControl, Button, Slider,
  Divider, Box, Select, Switch, ColorInput, NumberInput, Alert
} from "@mantine/core";
import type { PlotKind, SeriesStyle, PlotStyleDefaults, SeriesRule, SeriesRuleKey } from "./plots/plotStyleTypes";
import {
  loadBaseDefaults, loadUserOverrides, saveUserOverrides,
  mergeDefaults, setMergedDefaults
} from "./plots/plotStyleStore";
import { resolveSeriesStyle } from "./plots/plotStyleResolve";
import { parseTimeSeriesType, timeSeriesTypeToString } from "../timeSeries/timeSeriesType";
import TextStore from "../utils/TextStore";

const DASH_CHOICES: { label: string; value: Dash }[] = [
  { label: TextStore.interface("ComponentPlotStyle_Style_Dash_Solid"), value: "solid" },
  { label: TextStore.interface("ComponentPlotStyle_Style_Dash_Dash"), value: "dash" },
  { label: TextStore.interface("ComponentPlotStyle_Style_Dash_Dot"), value: "dot" },
  { label: TextStore.interface("ComponentPlotStyle_Style_Dash_DashDot"), value: "dashdot" },
  { label: TextStore.interface("ComponentPlotStyle_Style_Dash_LongDash"), value: "longdash" },
  { label: TextStore.interface("ComponentPlotStyle_Style_Dash_LongDashDot"), value: "longdashdot" }
];

const PANEL_STATE_KEY = "plotStylePanelStateV1";

type PanelState = {
  kind: PlotKind;
  parameter: string;
  seriesName?: string;
  seriesIndex?: number;
};

const BASELINE_STYLE: SeriesStyle = {
  drawLine: true,
  drawPoints: false,
  lineWidth: 2,
  lineDash: "solid"
};

/** Canonicalize parameter for storage & comparison */
function canonicalParam(p?: string): string | undefined {
  const t = parseTimeSeriesType(p);
  if (t) return timeSeriesTypeToString(t);
  if (!p) return undefined;
  return String(p).trim().toUpperCase();
}

/** Build a normalized key used to de-dupe rules (canon param, lowercased seriesName) */
function normalizeKey(k: SeriesRuleKey): Required<Pick<SeriesRuleKey, "kind" | "parameter">> & {
  seriesName?: string;
  seriesIndex?: number;
} {
  const out: any = {};
  if (k.kind) out.kind = k.kind;
  out.parameter = canonicalParam(k.parameter) || k.parameter;
  if (k.seriesName) out.seriesName = String(k.seriesName).toLowerCase();
  if (typeof k.seriesIndex === "number") out.seriesIndex = k.seriesIndex;
  return out;
}

function matchesNormalized(a: SeriesRuleKey, b: SeriesRuleKey): boolean {
  const A = normalizeKey(a);
  const B = normalizeKey(b);
  return (
    A.kind === B.kind &&
    A.parameter === B.parameter &&
    (A.seriesName || "") === (B.seriesName || "") &&
    (A.seriesIndex ?? undefined) === (B.seriesIndex ?? undefined)
  );
}

function loadPanelState(): PanelState | null {
  try {
    const raw = typeof window !== "undefined" ? window.localStorage.getItem(PANEL_STATE_KEY) : null;
    return raw ? (JSON.parse(raw) as PanelState) : null;
  } catch { return null; }
}

function savePanelState(s: PanelState) {
  try {
    if (typeof window !== "undefined") {
      window.localStorage.setItem(PANEL_STATE_KEY, JSON.stringify(s));
    }
  } catch { /* ignore */ }
}

function shallowEqualStyle(a?: SeriesStyle, b?: SeriesStyle): boolean {
  if (!a && !b) return true;
  if (!a || !b) return false;
  const keys = new Set([...Object.keys(a), ...Object.keys(b)]);
  for (const k of keys) {
    // @ts-ignore
    if (a[k] !== b[k]) return false;
  }
  return true;
}

export default function ComponentPlotStyle(): JSX.Element {
  const [base, setBase] = useState<PlotStyleDefaults | null>(null);
  const [user, setUser] = useState<PlotStyleDefaults>({ rules: [] });

  // restore last target
  const restored = loadPanelState();
  const [kind, setKind] = useState<PlotKind>(restored?.kind ?? "time_series");
  const [parameter, setParameter] = useState<string>(restored?.parameter ?? "FLOW");
  const [seriesName, setSeriesName] = useState<string>(restored?.seriesName ?? "");
  const [seriesIndex, setSeriesIndex] = useState<number | undefined>(restored?.seriesIndex);

  const [draft, setDraft] = useState<SeriesStyle>(BASELINE_STYLE);

  useEffect(() => {
    let live = true;
    (async () => {
      const b = await loadBaseDefaults();
      const u = await loadUserOverrides();
      if (!live) return;
      setBase(b);
      setUser(u || { rules: [] });
      setMergedDefaults(mergeDefaults(b, u || { rules: [] }));
    })();
    return () => { live = false; };
  }, []);

  const merged = useMemo(() => (base ? mergeDefaults(base, user) : null), [base, user]);

  const currentKey = useMemo(() => {
    const key: any = { kind, parameter };
    if (seriesName) key.seriesName = seriesName;
    if (typeof seriesIndex === "number") key.seriesIndex = seriesIndex;
    savePanelState({ kind, parameter, seriesName: seriesName || undefined, seriesIndex });
    return key;
  }, [kind, parameter, seriesName, seriesIndex]);

  useEffect(() => {
    if (!merged) return;
    const resolved = resolveSeriesStyle(merged, currentKey) || BASELINE_STYLE;
    if (!shallowEqualStyle(draft, resolved)) setDraft(resolved);
  }, [merged, currentKey]);

  function addOrReplaceRule() {
    const canonParam = canonicalParam(parameter) || parameter;
    const keyForSave: any = { kind, parameter: canonParam };
    if (seriesName) keyForSave.seriesName = seriesName;
    if (typeof seriesIndex === "number") keyForSave.seriesIndex = seriesIndex;

    const next: PlotStyleDefaults = { ...user, rules: [...user.rules] };
    const normalizedBefore = normalizeKey(keyForSave);
    const filtered = next.rules.filter(r => !matchesNormalized(r.match, normalizedBefore));
    const rule: SeriesRule = { match: keyForSave, style: { ...draft } };
    filtered.push(rule);

    const nextUser: PlotStyleDefaults = { ...next, rules: filtered };
    setUser(nextUser);
    void saveUserOverrides(nextUser);
    if (base) setMergedDefaults(mergeDefaults(base, nextUser));
  }

  function removeRule() {
    const canonParam = canonicalParam(parameter) || parameter;
    const keyForSave: any = { kind, parameter: canonParam };
    if (seriesName) keyForSave.seriesName = seriesName;
    if (typeof seriesIndex === "number") keyForSave.seriesIndex = seriesIndex;

    const normalizedKey = normalizeKey(keyForSave);
    const next: PlotStyleDefaults = {
      ...user,
      rules: user.rules.filter(r => !matchesNormalized(r.match, normalizedKey)),
    };
    setUser(next);
    void saveUserOverrides(next);
    if (base) setMergedDefaults(mergeDefaults(base, next));
  }

  if (!merged) {
    return (
      <Card withBorder radius="md" p="sm">
        <Text size="sm">Loading defaults…</Text>
      </Card>
    );
  }

  return (
    <Card withBorder radius="md" p="sm">
      <Stack gap="md">
        <Text fw={600} size="sm">{TextStore.interface("ComponentPlotStyle_PlotDefaults")}</Text>

        <Alert color="gray" variant="light">
          {TextStore.interface("ComponentPlotStyle_Message")}
        </Alert>

        <Group wrap="wrap" gap="sm">
          <Box w={220}>
            <Text size="xs" c="dimmed" mb={4}>
              {TextStore.interface("ComponentPlotStyle_KindLabel")}
            </Text>
            <Select
              size="xs"
              data={[
                {
                  label: TextStore.interface("ComponentPlotStyle_Kind_TimeSeries"),
                  value: "time_series"
                },
                {
                  label: TextStore.interface("ComponentPlotStyle_Kind_PairedXY"),
                  value: "paired_xy"
                },
                {
                  label: TextStore.interface("ComponentPlotStyle_Kind_FrequencyCurve"),
                  value: "frequency_curve"
                },
                {
                  label: TextStore.interface("ComponentPlotStyle_Kind_Scatter"),
                  value: "scatter"
                }
              ]}
              value={kind}
              onChange={(v) => setKind((v as PlotKind) || "time_series")}
            />
          </Box>

          <Box w={220}>
            <Text size="xs" c="dimmed" mb={4}>
              {TextStore.interface("ComponentPlotStyle_ParameterLabel")}
            </Text>
            <Select
              searchable
              clearable
              size="xs"
              data={[
                {
                  label: TextStore.interface("ComponentPlotStyle_Parameter_Flow"),
                  value: "FLOW"
                },
                {
                  label: TextStore.interface("ComponentPlotStyle_Parameter_Precipitation"),
                  value: "PRECIPITATION"
                },
                {
                  label: TextStore.interface("ComponentPlotStyle_Parameter_Stage"),
                  value: "STAGE"
                },
                {
                  label: TextStore.interface("ComponentPlotStyle_Parameter_Storage"),
                  value: "STORAGE"
                },
                {
                  label: TextStore.interface("ComponentPlotStyle_Parameter_Temperature"),
                  value: "TEMPERATURE"
                }
              ]}
              value={parameter}
              onChange={(v) => setParameter(v ?? "FLOW")}
              placeholder="Parameter (e.g. FLOW, PRECIPITATION)"
            />
          </Box>

          <Box w={260}>
            <Text size="xs" c="dimmed" mb={4}>Series name (optional)</Text>
            <Select
              searchable
              clearable
              size="xs"
              data={[]}
              value={seriesName}
              onChange={(v) => setSeriesName(v ?? "")}
              placeholder="Exact legend name"
            />
          </Box>

          <Box w={160}>
            <Text size="xs" c="dimmed" mb={4}>Series index (optional)</Text>
            <NumberInput
              size="xs"
              min={0}
              value={seriesIndex}
              onChange={(v) => setSeriesIndex(typeof v === "number" ? v : undefined)}
            />
          </Box>
        </Group>

        <Divider />

        <Text fw={600} size="xs">{TextStore.interface("ComponentPlotStyle_StyleLabel")}</Text>
        <Group wrap="wrap" gap="sm">
          <Switch
            size="xs"
            checked={draft.drawLine !== false}
            onChange={(e) => setDraft(
              { ...draft, drawLine: e.currentTarget.checked })}
            label={TextStore.interface("ComponentPlotStyle_Style_DrawLine")}
          />
          <Switch
            size="xs"
            checked={draft.drawPoints === true}
            onChange={(e) => setDraft({ ...draft, drawPoints: e.currentTarget.checked })}
            label={TextStore.interface("ComponentPlotStyle_Style_DrawPoints")}
          />
          <ColorInput
            size="xs"
            label={TextStore.interface("ComponentPlotStyle_Style_LineColor")}
            value={draft.lineColor}
            onChange={(v) => setDraft({ ...draft, lineColor: v })}
            withPicker
          />
          <Box w={160}>
            <Text size="xs" c="dimmed" mb={4}>
              {TextStore.interface("ComponentPlotStyle_Style_LineWidth")}
            </Text>
            <Slider
              size="xs"
              min={1}
              max={8}
              step={1}
              value={draft.lineWidth || 2}
              onChange={(v) => setDraft({ ...draft, lineWidth: v })}
            />
          </Box>
          <Box w={280}>
            <Text size="xs" c="dimmed" mb={4}>
              {TextStore.interface("ComponentPlotStyle_Style_Dash")}
            </Text>
            <SegmentedControl
              size="xs"
              value={draft.lineDash || "solid"}
              onChange={(v) => setDraft({ ...draft, lineDash: v as Dash })}
              data={DASH_CHOICES.map(d => ({ label: d.label, value: d.value }))}
            />
          </Box>
          <ColorInput
            size="xs"
            label={TextStore.interface("ComponentPlotStyle_Style_PointFill")}
            value={draft.pointFillColor}
            onChange={(v) => setDraft({ ...draft, pointFillColor: v })}
            withPicker
          />
          <ColorInput
            size="xs"
            label={TextStore.interface("ComponentPlotStyle_Style_PointLine")}
            value={draft.pointLineColor}
            onChange={(v) => setDraft({ ...draft, pointLineColor: v })}
            withPicker
          />
          <Box w={160}>
            <Text size="xs" c="dimmed" mb={4}>
              {TextStore.interface("ComponentPlotStyle_Style_PointSize")}
            </Text>
            <Slider
              size="xs"
              min={3}
              max={12}
              step={1}
              value={draft.pointSize || 7}
              onChange={(v) => setDraft({ ...draft, pointSize: v })}
            />
          </Box>
        </Group>

        <Group justify="flex-end">
          <Button size="xs" color="red" onClick={removeRule}>
            {TextStore.interface("ComponentPlotStyle_Button_ResetRule")}
          </Button>
          <Button size="xs" onClick={addOrReplaceRule}>
            {TextStore.interface("ComponentPlotStyle_Button_SaveRule")}
          </Button>
        </Group>
      </Stack>
    </Card>
  );
}
