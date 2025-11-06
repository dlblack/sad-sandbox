import React, { useEffect, useRef, useState } from "react";
import TimeseriesPathnameStep from "./TimeseriesPathnameStep";
import DataInfoStepCommon from "./DataInfoStepCommon";
import PairedDataTableStep from "./PairedDataTableStep";
import TimeseriesDataEntryStep from "./TimeseriesDataEntryStep";
import WizardNavigation from "../../common/WizardNavigation";
import StructureSelector from "../../editor_components/combo_boxes/StructureSelector";
import FormatSelector from "../../editor_components/combo_boxes/FormatSelector";
import PairedCurveTypeComboBox, { CURVE_TYPE_DEFAULTS } from "../../editor_components/combo_boxes/PairedCurveTypeComboBox";
import { DataUnitType } from "../../editor_components/combo_boxes/DataUnitTypeComboBox";
import { getParamCategory } from "../../../utils/paramUtils";
import { toJulianDay } from "../../../utils/timeUtils";
import { TextStore } from "../../../utils/TextStore";
import { Card, Stack, TextInput, Textarea, ScrollArea, Table, Text, Title, Code } from "@mantine/core";
import { useProject } from "../../../context/ProjectContext";

/** ---------- Types ---------- */
type StructureType = "TimeSeries" | "PairedData";
type DataFormat = "DSS" | "JSON";

type PathParts = { A: string; B: string; C: string; D: string; E: string; F: string };

type TimeSeriesRow = { dateTime: string; value: string };
type PairedRow = { x: string; y: string };

export interface ManualDataEntryEditorProps {
  id?: string;
  onDataSave?: (category: string, payload: any, id?: string) => void | Promise<void>;
  onRemove?: () => void;
  onFinish?: (type: string, valuesObj: any, id?: string) => Promise<void> | void; // wired by DockableFrame
}

/** DSS date formatter (DDMONYYYY in UTC) */
function formatDssDate(dateStr?: string): string {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return "";
  const months = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
  const dd = String(d.getUTCDate()).padStart(2, "0");
  const mon = months[d.getUTCMonth()];
  const yyyy = d.getUTCFullYear();
  return `${dd}${mon}${yyyy}`;
}

/** Default DSS file path logic */
function getDefaultFilepath(projectName: string, parameter?: string): string {
  if (!parameter) return "";
  const key = parameter.trim().toLowerCase();
  const exceptions: Record<string, string> = {
    flow: "discharge",
    discharge: "discharge",
    "snow water equivalent": "swe",
    swe: "swe",
    "elev-stor": "elevstor",
    "stage-disch": "stagedisch",
    "freq-flow": "freqflow",
  };
  if (exceptions[key]) return `public/${projectName}/${exceptions[key]}.dss`;
  const filename = key.replace(/\s+/g, "").replace(/[^a-z0-9]/g, "");
  return `public/${projectName}/${filename}.dss`;
}

export default function ManualDataEntryEditor(props: ManualDataEntryEditorProps) {
  const { apiPrefix } = useProject();  // Get the current project name dynamically from context
  const projectName = apiPrefix?.split("/")[2] || "default"; // Extract project name from the API prefix

  const [step, setStep] = useState<number>(1);

  // Metadata
  const [name, setName] = useState<string>("");
  const [desc, setDesc] = useState<string>("");
  const [structureType, setStructureType] = useState<StructureType>("TimeSeries");
  const [dataFormat, setDataFormat] = useState<DataFormat>("DSS");

  // TimeSeries state
  const [tsPathnameParts, setTsPathnameParts] = useState<PathParts>({ A: "", B: "", C: "", D: "", E: "", F: "" });
  const [tsParameter, setTsParameter] = useState<string>("");
  const [tsUnits, setTsUnits] = useState<string>("");
  const [tsInterval, setTsInterval] = useState<string>("");
  const [tsStartDate, setTsStartDate] = useState<string>("");
  const [tsStartTime, setTsStartTime] = useState<string>("");
  const [tsEndDate, setTsEndDate] = useState<string>("");
  const [tsEndTime, setTsEndTime] = useState<string>("");
  /** IMPORTANT: unit type should match the union expected by DataInfoStepCommon */
  const [tsUnitType, setTsUnitType] = useState<DataUnitType | "">("");
  const [tsDataRows, setTsDataRows] = useState<TimeSeriesRow[]>([{ dateTime: "", value: "" }]);

  // Paired data state
  const [pairedPathnameParts, setPairedPathnameParts] = useState<PathParts>({ A: "", B: "", C: "", D: "", E: "", F: "" });
  const [pairedCurveType, setPairedCurveType] = useState<string>("");
  const [pairedYLabel, setPairedYLabel] = useState<string>("");
  const [pairedYUnits, setPairedYUnits] = useState<string>("");
  const [pairedXLabel, setPairedXLabel] = useState<string>("");
  const [pairedXUnits, setPairedXUnits] = useState<string>("");
  const [pairedRows, setPairedRows] = useState<PairedRow[]>([{ x: "", y: "" }, { x: "", y: "" }, { x: "", y: "" }]);

  const prevCurveType = useRef<string | undefined>(undefined);

  /** When Paired curve type changes, seed defaults for labels/units */
  useEffect(() => {
    if (structureType !== "PairedData") return;
    if (!pairedCurveType) return;
    const defaults = (CURVE_TYPE_DEFAULTS as any)?.[pairedCurveType];
    if (!defaults) return;

    if (!pairedYLabel || prevCurveType.current !== pairedCurveType) setPairedYLabel(defaults.yLabel);
    if (!pairedYUnits || prevCurveType.current !== pairedCurveType) setPairedYUnits(defaults.yUnits);
    if (!pairedXLabel || prevCurveType.current !== pairedCurveType) setPairedXLabel(defaults.xLabel);
    if (!pairedXUnits || prevCurveType.current !== pairedCurveType) setPairedXUnits(defaults.xUnits);
    prevCurveType.current = pairedCurveType;
  }, [pairedCurveType, structureType, pairedYLabel, pairedYUnits, pairedXLabel, pairedXUnits]);

  /** Keep DSS timeseries pathname parts synced with inputs */
  useEffect(() => {
    setTsPathnameParts((parts) => ({
      ...parts,
      C: tsParameter || "",
      D: tsStartDate ? formatDssDate(tsStartDate) : "",
      E: tsInterval || "",
    }));
  }, [tsParameter, tsStartDate, tsInterval]);

  /** PairedData uses empty D part */
  useEffect(() => {
    if (structureType === "PairedData") {
      setPairedPathnameParts((parts) => ({ ...parts, D: "" }));
    }
  }, [structureType]);

  function renderStep(): React.ReactNode {
    // Step 1: meta + selectors
    if (step === 1) {
      return (
          <div className="manual-entry-content">
            <Title size="h4">{TextStore.interface("ManualDataEntryEditor_Legend")}</Title>

            {/* Name */}
            <div className="manual-entry-row">
              <label className="manual-entry-label">{TextStore.interface("ManualDataEntryEditor_Name")}</label>
              <div className="manual-entry-field">
                <TextInput size="sm" value={name} onChange={(e) => setName(e.currentTarget.value)} maxLength={64} required />
              </div>
            </div>

            {/* Description */}
            <div className="manual-entry-row">
              <label className="manual-entry-label">{TextStore.interface("ManualDataEntryEditor_Description")}</label>
              <div className="manual-entry-field">
                <Textarea
                    size="sm"
                    value={desc}
                    onChange={(e) => setDesc(e.currentTarget.value)}
                    maxLength={256}
                    autosize
                    minRows={2}
                />
              </div>
            </div>

            {/* Structure + Format */}
            <StructureSelector
                value={structureType}
                onChange={(v: "" | "TimeSeries" | "PairedData") => setStructureType(v === "" ? "TimeSeries" : v)}
            />
            <FormatSelector value={dataFormat} onChange={(v: "" | "DSS" | "JSON") => setDataFormat(v === "" ? "DSS" : v)} />
          </div>
      );
    }

    // Step 2: TimeSeries
    if (step === 2 && structureType === "TimeSeries") {
      return (
          <div>
            {dataFormat === "DSS" && (
                <TimeseriesPathnameStep
                    pathnameParts={tsPathnameParts}
                    setPathnameParts={setTsPathnameParts}
                    editableParts={{ A: true, B: true, C: true, D: true, E: true, F: true }}
                />
            )}
            <DataInfoStepCommon
                showParameterCombo
                parameter={tsParameter}
                setParameter={setTsParameter}
                units={tsUnits}
                setUnits={setTsUnits}
                unitType={tsUnitType}
                setUnitType={setTsUnitType}
                dataInterval={tsInterval}
                setDataInterval={setTsInterval}
                startDate={tsStartDate}
                setStartDate={setTsStartDate}
                startTime={tsStartTime}
                setStartTime={setTsStartTime}
                endDate={tsEndDate}
                setEndDate={setTsEndDate}
                endTime={tsEndTime}
                setEndTime={setTsEndTime}
            />
          </div>
      );
    }

    // Step 2: PairedData
    if (step === 2 && structureType === "PairedData") {
      if (dataFormat === "DSS") {
        return (
            <div>
              <TimeseriesPathnameStep
                  pathnameParts={pairedPathnameParts}
                  setPathnameParts={(parts: PathParts) => setPairedPathnameParts({ ...parts, D: "" })}
                  editableParts={{ A: true, B: true, C: true, D: false, E: true, F: true }}
              />

              <div className="manual-entry-row">
                <label className="manual-entry-label">{TextStore.interface("ManualDataEntryEditor_CurveType")}</label>
                <div className="manual-entry-field">
                  <PairedCurveTypeComboBox
                      value={pairedCurveType}
                      onChange={(val: string) => {
                        setPairedCurveType(val);
                        setPairedPathnameParts((parts) => ({ ...parts, C: val }));
                      }}
                  />
                </div>
              </div>

              <div className="manual-entry-row">
                <label className="manual-entry-label">{TextStore.interface("ManualDataEntryEditor_YLabel")}</label>
                <div className="manual-entry-field">
                  <TextInput size="sm" value={pairedYLabel} onChange={(e) => setPairedYLabel(e.currentTarget.value)} />
                </div>
              </div>

              <div className="manual-entry-row">
                <label className="manual-entry-label">{TextStore.interface("ManualDataEntryEditor_YUnits")}</label>
                <div className="manual-entry-field">
                  <TextInput size="sm" value={pairedYUnits} onChange={(e) => setPairedYUnits(e.currentTarget.value)} />
                </div>
              </div>

              <div className="manual-entry-row">
                <label className="manual-entry-label">{TextStore.interface("ManualDataEntryEditor_XLabel")}</label>
                <div className="manual-entry-field">
                  <TextInput size="sm" value={pairedXLabel} onChange={(e) => setPairedXLabel(e.currentTarget.value)} />
                </div>
              </div>

              <div className="manual-entry-row">
                <label className="manual-entry-label">{TextStore.interface("ManualDataEntryEditor_XUnits")}</label>
                <div className="manual-entry-field">
                  <TextInput size="sm" value={pairedXUnits} onChange={(e) => setPairedXUnits(e.currentTarget.value)} />
                </div>
              </div>
            </div>
        );
      }

      if (dataFormat === "JSON") {
        return (
            <div>
              <div className="manual-entry-row">
                <label className="manual-entry-label">{TextStore.interface("ManualDataEntryEditor_CurveType")}</label>
                <div className="manual-entry-field">
                  <PairedCurveTypeComboBox value={pairedCurveType} onChange={setPairedCurveType} />
                </div>
              </div>

              <div className="manual-entry-row">
                <label className="manual-entry-label">{TextStore.interface("ManualDataEntryEditor_YLabel")}</label>
                <div className="manual-entry-field">
                  <TextInput size="sm" value={pairedYLabel} onChange={(e) => setPairedYLabel(e.currentTarget.value)} />
                </div>
              </div>

              <div className="manual-entry-row">
                <label className="manual-entry-label">{TextStore.interface("ManualDataEntryEditor_YUnits")}</label>
                <div className="manual-entry-field">
                  <TextInput size="sm" value={pairedYUnits} onChange={(e) => setPairedYUnits(e.currentTarget.value)} />
                </div>
              </div>

              <div className="manual-entry-row">
                <label className="manual-entry-label">{TextStore.interface("ManualDataEntryEditor_XLabel")}</label>
                <div className="manual-entry-field">
                  <TextInput size="sm" value={pairedXLabel} onChange={(e) => setPairedXLabel(e.currentTarget.value)} />
                </div>
              </div>

              <div className="manual-entry-row">
                <label className="manual-entry-label">{TextStore.interface("ManualDataEntryEditor_XUnits")}</label>
                <div className="manual-entry-field">
                  <TextInput size="sm" value={pairedXUnits} onChange={(e) => setPairedXUnits(e.currentTarget.value)} />
                </div>
              </div>
            </div>
        );
      }
    }

    // Step 3: TimeSeries Data
    if (step === 3 && structureType === "TimeSeries") {
      return (
          <TimeseriesDataEntryStep
              dataRows={tsDataRows}
              setDataRows={setTsDataRows}
              startDate={tsStartDate}
              startTime={tsStartTime}
              endDate={tsEndDate}
              endTime={tsEndTime}
              dataInterval={tsInterval}
          />
      );
    }

    // Step 3: PairedData Table
    if (step === 3 && structureType === "PairedData") {
      return (
          <PairedDataTableStep
              rows={pairedRows}
              setRows={setPairedRows}
              yLabel={pairedCurveType}
              yUnits={pairedYUnits}
              xLabel={pairedXLabel}
              xUnits={pairedXUnits}
          />
      );
    }

    // Step 4: Confirmation
    if (step === 4) {
      const { A, B, C, E, F } = pairedPathnameParts;
      const pairedPathname = `/${A || ""}/${B || ""}/${C || ""}//${E || ""}/${F || ""}/`;
      return (
          <div className={"summary-root"}>
            <h4>{TextStore.interface("Wizard_Summary_Title")}</h4>
            <div className="my-2 font-s">
              {TextStore.interface("Wizard_Summary_Name")}
              {name}
            </div>
            <div className="my-2 font-s">
              {TextStore.interface("Wizard_Summary_Description")}
              {desc}
            </div>
            <div className="my-2 font-s">
              {TextStore.interface("ManualDataEntryEditor_SummaryStructureType")}
              {structureType}
            </div>
            <div className="my-2 font-s">
              {TextStore.interface("ManualDataEntryEditor_SummaryDataFormat")}
              {dataFormat}
            </div>

            {structureType === "TimeSeries" && <TimeSeriesSummaryTable rows={tsDataRows} />}

            {structureType === "PairedData" && (
                <>
                  <div className="my-2 font-s">
                    {TextStore.interface("ManualDataEntryEditor_SummaryFilepath")}
                    {getDefaultFilepath(pairedCurveType, projectName)}
                  </div>
                  <div className="my-2 font-s">
                    {TextStore.interface("ManualDataEntryEditor_SummaryPathname")}
                    {pairedPathname}
                  </div>
                  <div className="my-2 font-s">
                    {TextStore.interface("ManualDataEntryEditor_SummaryCurveType")}
                    {pairedCurveType}
                  </div>
                  <div className="my-2 font-s">
                    {TextStore.interface("ManualDataEntryEditor_SummaryYUnits")}
                    {pairedYUnits}
                  </div>
                  <div className="my-2 font-s">
                    {TextStore.interface("ManualDataEntryEditor_SummaryXLabel")}
                    {pairedXLabel}
                  </div>
                  <div className="my-2 font-s">
                    {TextStore.interface("ManualDataEntryEditor_SummaryXUnits")}
                    {pairedXUnits}
                  </div>

                  <PairedSummaryTable rows={pairedRows} xLabel={pairedXLabel} yLabel={pairedCurveType} />
                </>
            )}
          </div>
      );
    }

    return null;
  }

  /** Save logic */
  async function handleWizardFinish(e?: React.FormEvent) {
    if (e) e.preventDefault();

    const createdText = (_category: string, itemName: string) =>
        TextStore.message(10002, [
          TextStore.interface("ComponentMetadata_ManualDataEntryEditor"),
          itemName,
        ]);

    function closeWithCreatedMessage(text: string) {
      const close = props.onRemove as unknown as (
          reason?: { text: string; type?: "success" | "info" | "warning" | "error" }
      ) => void;
      close?.({ text, type: "success" });
    }

    // TimeSeries
    if (structureType === "TimeSeries" && props.onDataSave) {
      const { A, B, C, D, E, F } = tsPathnameParts;
      const pathname = `/${A || ""}/${B || ""}/${C || ""}/${D || ""}/${E || ""}/${F || ""}/`;
      const dataRowsFiltered = tsDataRows.filter(
          r => r.value !== "" && !Number.isNaN(Number(r.value)) && r.dateTime !== ""
      );
      const values = dataRowsFiltered.map(r => Number(r.value));
      const dateTimes = dataRowsFiltered.map(r => r.dateTime);
      const paramCategory = getParamCategory(tsParameter);
      const filepath = getDefaultFilepath(tsParameter, projectName);

      let payload: any = {
        structureType,
        dataFormat,
        dataType: tsParameter,
        name,
        description: desc,
        parameter: tsParameter,
        units: tsUnits,
        interval: tsInterval,
        startDateTime: dateTimes[0] || "",
        endDateTime: dateTimes.at(-1) || "",
        values,
      };

      if (dataFormat === "DSS") {
        payload = {
          ...payload,
          filepath,
          pathname,
          times: dateTimes.map((dtStr) => toJulianDay(new Date(dtStr))),
        };
      } else {
        payload = { ...payload, times: dateTimes };
      }

      await props.onDataSave(paramCategory, payload, props.id);
      closeWithCreatedMessage(createdText(paramCategory, name));
      return;
    }

    // PairedData DSS
    if (structureType === "PairedData" && dataFormat === "DSS" && props.onDataSave) {
      const { A, B, C, E, F } = pairedPathnameParts;
      const pathname = `/${A || ""}/${B || ""}/${C || ""}//${E || ""}/${F || ""}/`;

      const filtered = pairedRows.filter(r => r.x !== "" && r.y !== "");
      const xValues = filtered.map(r => Number(r.x));
      const yValues = filtered.map(r => Number(r.y));

      const payload = {
        structureType,
        dataFormat,
        dataType: pairedCurveType,
        name,
        description: desc,
        parameter: pairedCurveType,
        units: pairedYUnits,
        xLabel: pairedXLabel,
        xUnits: pairedXUnits,
        yLabel: pairedYLabel,
        yUnits: pairedYUnits,
        filepath: getDefaultFilepath(pairedCurveType, projectName),
        pathname,
        xValues,
        yValues,
      };

      await props.onDataSave(pairedCurveType, payload, props.id);
      closeWithCreatedMessage(createdText(pairedCurveType, name));
      return;
    }

    // PairedData JSON
    if (structureType === "PairedData" && dataFormat === "JSON" && props.onDataSave) {
      const payload = {
        structureType,
        dataFormat,
        dataType: pairedCurveType,
        name,
        description: desc,
        yLabel: pairedCurveType,
        yUnits: pairedYUnits,
        xLabel: pairedXLabel,
        xUnits: pairedXUnits,
        rows: pairedRows.filter((r) => r.x !== "" && r.y !== ""),
      };

      await props.onDataSave(pairedCurveType, payload, props.id);
      closeWithCreatedMessage(createdText(pairedCurveType, name));
      return;
    }
  }

  const numSteps = 4;

  function canGoNext(): boolean {
    if (step === 1) return !!name.trim() && !!structureType && !!dataFormat;

    if (step === 2 && structureType === "TimeSeries") {
      return !!tsParameter && !!tsUnits && !!tsUnitType && !!tsStartDate && !!tsStartTime && !!tsEndDate && !!tsEndTime;
    }

    if (step === 2 && structureType === "PairedData") {
      if (dataFormat === "DSS") {
        const { C } = pairedPathnameParts;
        return !!C && !!pairedCurveType && !!pairedYUnits && !!pairedXLabel && !!pairedXUnits;
      }
      if (dataFormat === "JSON") {
        return !!pairedCurveType && !!pairedYUnits && !!pairedXLabel && !!pairedXUnits;
      }
    }

    if (step === 3 && structureType === "TimeSeries") {
      return tsDataRows.some((row) => row.value !== "");
    }

    if (step === 3 && structureType === "PairedData") {
      return pairedRows.some((row) => row.x !== "" && row.y !== "");
    }

    return true;
  }

  /* ---------- Summary tables ---------- */
  function TimeSeriesSummaryTable({ rows }: { rows: { dateTime: string; value: string }[] }) {
    const data = rows.filter((r) => r.dateTime && r.value !== "");
    return (
        <ScrollArea
            className="summary-scroll"
            type="always"
            scrollbars="y"
            offsetScrollbars
            scrollbarSize={12}
        >
          <Table stickyHeader layout="fixed" withRowBorders verticalSpacing="xs" horizontalSpacing="sm" highlightOnHover>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>{TextStore.interface("ManualDataEntryEditor_SummaryDateTime")}</Table.Th>
                <Table.Th>{TextStore.interface("ManualDataEntryEditor_SummaryValue")}</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {data.map((row, i) => (
                  <Table.Tr key={i}>
                    <Table.Td><Code fw={500}>{row.dateTime}</Code></Table.Td>
                    <Table.Td><Text>{row.value}</Text></Table.Td>
                  </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        </ScrollArea>
    );
  }

  function PairedSummaryTable({
                                rows, xLabel, yLabel,
                              }: { rows: { x: string; y: string }[]; xLabel?: string; yLabel?: string }) {
    const data = rows.filter((r) => r.x !== "" && r.y !== "");
    return (
        <ScrollArea className="summary-scroll" type="auto" scrollbars="y">
          <Table stickyHeader layout="fixed" withRowBorders verticalSpacing="xs" horizontalSpacing="sm" highlightOnHover>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>#</Table.Th>
                <Table.Th>{xLabel || "X"}</Table.Th>
                <Table.Th>{yLabel || "Y"}</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {data.map((row, idx) => (
                  <Table.Tr key={idx}>
                    <Table.Td><Text ta="center">{idx + 1}</Text></Table.Td>
                    <Table.Td><Code>{row.x}</Code></Table.Td>
                    <Table.Td><Code>{row.y}</Code></Table.Td>
                  </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        </ScrollArea>
    );
  }

  return (
      <Card withBorder radius="md" padding="md">
        <form onSubmit={(e) => e.preventDefault()} style={{ height: "100%" }}>
          <Stack gap="sm" style={{ height: "100%" }}>
            <div className="wizard-body">{renderStep()}</div>
            <div className="wizard-footer">
              <WizardNavigation
                  step={step}
                  setStep={setStep}
                  numSteps={numSteps}
                  onFinish={handleWizardFinish}
                  finishLabel="Create"
                  disableNext={!canGoNext()}
                  onCancel={() => props.onRemove?.()}
              />
            </div>
          </Stack>
        </form>
      </Card>
  );
}
