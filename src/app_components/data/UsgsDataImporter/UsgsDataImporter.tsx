import React, { useEffect, useRef, useState } from "react";
import { Card, Stack } from "@mantine/core";
import WizardNavigation from "../../common/WizardNavigation";
import { useProject } from "../../../context/ProjectContext";
import UsgsMetaStep from "./UsgsMetaStep";
import UsgsStationsStep from "./UsgsStationsStep";
import UsgsStationIdsByStateDialog from "../../../dialogs/UsgsStationIdsByStateDialog";
import { fetchStationsByState, UsgsStationMeta, UsgsTimeZone } from "../../../api/usgsApi";
import { UsgsDataType } from "../../../api/usgs/io/UsgsDataType";
import { TimeSeriesType } from "../../../timeSeries/timeSeriesType";
import TextStore from "../../../utils/TextStore";
import { STATE_OPTIONS } from "../../../utils/usStates";
import {
  DataFormat,
  StationRow,
  getPrimaryVariety,
  runUsgsImport,
  ProgressUpdate,
  StationSummary,
} from "./usgsImportLogic";
import UsgsProgressDialog from "./UsgsProgressDialog";

export type StationSourceMode = "manual" | "byState";

export interface UsgsDataImporterProps {
  id?: string;
  onDataSave?: (category: string, payload: unknown, id?: string) => void | Promise<void>;
  onRemove?: () => void;
  onFinish?: (type: string, valuesObj: unknown, id?: string) => Promise<void> | void;
}

const USGS_DATA_TYPE_LABELS: Record<UsgsDataType, string> = {
  [UsgsDataType.ANNUAL_PEAKS]: "Annual Peak Data",
  [UsgsDataType.DAILY]: "Daily",
  [UsgsDataType.INSTANTANEOUS]: "Instantaneous",
};

function clampPercent(percent: number): number {
  if (!Number.isFinite(percent)) return 0;
  if (percent < 0) return 0;
  if (percent > 100) return 100;
  return percent;
}

function setGlobalUsgsWriteJobId(jobId: string | null): void {
  (globalThis as any).__USGS_WRITE_JOB_ID = jobId || null;
}

function isSingleBlankStationRow(rows: StationRow[]): boolean {
  return (
    rows.length === 1 &&
    rows[0].id.trim() === "" &&
    rows[0].aPart.trim() === "" &&
    rows[0].bPart.trim() === ""
  );
}

function mergeStationsFromApi(existingRows: StationRow[], apiStations: UsgsStationMeta[]): StationRow[] {
  const baseRows = isSingleBlankStationRow(existingRows) ? [] : existingRows;

  const knownIds = new Set(baseRows.map((row) => row.id));
  const newRows: StationRow[] = apiStations
    .filter((station) => station.id && !knownIds.has(station.id))
    .map((station) => ({
      id: station.id,
      aPart: station.name,
      bPart: station.location,
      fPart: "USGS",
      importFlag: true,
    }));

  return baseRows.concat(newRows);
}

async function safeReadJson<T>(response: Response): Promise<T | null> {
  try {
    return (await response.json()) as T;
  } catch {
    return null;
  }
}

export default function UsgsDataImporter(props: UsgsDataImporterProps) {
  const { apiPrefix } = useProject();
  const projectName = apiPrefix?.split("/")?.[2] || "default";

  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 2;

  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  const [dataFormat, setDataFormat] = useState<DataFormat>("DSS");

  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [retrievePor, setRetrievePor] = useState(false);
  const [timeZone, setTimeZone] = useState<UsgsTimeZone>("UTC");

  const [dataType, setDataType] = useState<UsgsDataType>(UsgsDataType.ANNUAL_PEAKS);
  const [variety, setVariety] = useState<TimeSeriesType[]>([TimeSeriesType.FLOW]);
  const [stationMode, setStationMode] = useState<StationSourceMode>("manual");

  const [stations, setStations] = useState<StationRow[]>([
    { id: "", aPart: "", bPart: "", fPart: "USGS", importFlag: true },
  ]);

  const [retrievedStates, setRetrievedStates] = useState<string[]>([]);
  const [stateDialogOpen, setStateDialogOpen] = useState(false);

  const [isImporting, setIsImporting] = useState(false);

  const [progressDialogOpen, setProgressDialogOpen] = useState(false);
  const [progressDone, setProgressDone] = useState(false);
  const [progressSummary, setProgressSummary] = useState<StationSummary | null>(null);

  const [queryPercent, setQueryPercent] = useState(0);
  const [downloadPercent, setDownloadPercent] = useState(0);
  const [writePercent, setWritePercent] = useState(0);

  const [queryLabel, setQueryLabel] = useState<string | null>(null);
  const [downloadLabel, setDownloadLabel] = useState<string | null>(null);
  const [writeLabel, setWriteLabel] = useState<string | null>(null);

  const writeJobIdRef = useRef<string | null>(null);
  const writeSseRef = useRef<EventSource | null>(null);

  function closeWriteProgressStream(): void {
    if (writeSseRef.current) {
      try {
        writeSseRef.current.close();
      } catch {
        // ignore
      }
      writeSseRef.current = null;
    }
  }

  async function startDssWriteJobAndSubscribe(): Promise<void> {
    if (dataFormat !== "DSS") return;

    const response = await fetch("/api/usgs/write-job", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ expectedBatches: variety.length }),
    });

    if (!response.ok) throw new Error("Failed to create write job");

    const json = await safeReadJson<{ jobId?: string }>(response);
    const jobId = String(json?.jobId || "");
    if (!jobId) throw new Error("Missing jobId");

    writeJobIdRef.current = jobId;
    setGlobalUsgsWriteJobId(jobId);

    closeWriteProgressStream();

    const eventSource = new EventSource(
      `/api/usgs/write-progress?jobId=${encodeURIComponent(jobId)}`
    );
    writeSseRef.current = eventSource;

    eventSource.onmessage = (event) => {
      let payload: any;
      try {
        payload = JSON.parse(event.data);
      } catch {
        return;
      }
      if (!payload || payload.phase !== "write") return;

      const doneCount = Number(payload.done ?? 0);
      const totalCount = Number(payload.total ?? 0);

      setWritePercent((prev) => {
        const next = totalCount > 0 ? Math.round((doneCount / totalCount) * 100) : 0;
        return Math.max(prev, clampPercent(next));
      });

      const label = String(payload.label || "");
      if (label) setWriteLabel(label);
    };

    eventSource.onerror = () => {
      closeWriteProgressStream();
    };
  }

  useEffect(() => {
    return () => {
      closeWriteProgressStream();
      writeJobIdRef.current = null;
      setGlobalUsgsWriteJobId(null);
    };
  }, []);

  function handleToggleAllImport(checked: boolean): void {
    setStations((prev) => prev.map((row) => ({ ...row, importFlag: checked })));
  }

  function handleDeleteRow(index: number): void {
    setStations((prev) => prev.filter((_, i) => i !== index));
  }

  function handleAddRow(): void {
    const newRow: StationRow = { id: "", aPart: "", bPart: "", fPart: "USGS", importFlag: true };
    setStations((prev) => prev.concat(newRow));
  }

  function handleChangeStationField(index: number, field: keyof StationRow, value: string | boolean): void {
    setStations((prev) =>
      prev.map((row, idx) => (idx === index ? { ...row, [field]: value } : row))
    );
  }

  function handleOpenStateDialog(): void {
    setStateDialogOpen(true);
  }

  function handleCancelStateDialog(): void {
    setStateDialogOpen(false);
  }

  async function handleStateDialogConfirm(stateCode: string): Promise<void> {
    setStateDialogOpen(false);
    try {
      const primaryVariety = getPrimaryVariety(variety);
      const meta = await fetchStationsByState({ state: stateCode, variety: primaryVariety });

      setRetrievedStates((prev) => (prev.includes(stateCode) ? prev : prev.concat(stateCode)));
      setStations((prev) => mergeStationsFromApi(prev, meta));
    } catch (err) {
      console.error("Error fetching stations from USGS", err);
    }
  }

  function canGoNext(): boolean {
    if (currentStep === 1) return name.trim().length > 0;
    if (currentStep === 2) {
      const selected = stations.filter((row) => row.importFlag && row.id.trim().length > 0);
      return selected.length > 0;
    }
    return true;
  }

  function onProgress(progress: ProgressUpdate): void {
    if (progress.phase === "query") {
      const startIndex = progress.queryStart || 0;
      const endIndex = progress.queryEnd || 0;
      const total = progress.queryTotal || 0;

      setQueryLabel(
        TextStore.interface("UsgsDataImporter_Import_Progress_QueryingRange", [startIndex, endIndex, total])
      );
      setQueryPercent(total > 0 ? clampPercent((endIndex / total) * 100) : 0);
      return;
    }

    if (progress.phase === "download") {
      const doneCount = progress.downloadDone || 0;
      const totalCount = progress.downloadTotal || 0;

      setDownloadLabel(
        TextStore.interface("UsgsDataImporter_Import_Progress_Downloading", [doneCount, totalCount])
      );
      setDownloadPercent(totalCount > 0 ? clampPercent((doneCount / totalCount) * 100) : 0);
      return;
    }

    if (progress.phase === "write") {
      const key = progress.writeLabelKey || "UsgsDataImporter_Import_Write_Preparing";
      setWriteLabel(TextStore.interface(key));
      return;
    }

    if (progress.phase === "done") {
      setProgressDone(true);
      setProgressSummary(progress.summary || null);

      setQueryPercent(100);
      setDownloadPercent(100);

      setWriteLabel(TextStore.interface("UsgsDataImporter_Import_Write_Done"));
      return;
    }
  }

  function handleProgressClose(): void {
    if (!progressDone) return;

    setProgressDialogOpen(false);
    setProgressDone(false);
    setProgressSummary(null);

    setQueryPercent(0);
    setDownloadPercent(0);
    setWritePercent(0);

    setQueryLabel(null);
    setDownloadLabel(null);
    setWriteLabel(null);

    closeWriteProgressStream();
    writeJobIdRef.current = null;
    setGlobalUsgsWriteJobId(null);
  }

  async function handleFinish(
    e?: React.MouseEvent<HTMLButtonElement> | React.KeyboardEvent<HTMLDivElement>
  ): Promise<void> {
    if (e) e.preventDefault();
    if (isImporting) return;

    const selectedStations = stations.filter((row) => row.importFlag && row.id.trim().length > 0);
    if (selectedStations.length === 0) return;

    setIsImporting(true);

    setProgressDialogOpen(true);
    setProgressDone(false);
    setProgressSummary(null);

    setQueryPercent(0);
    setDownloadPercent(0);
    setWritePercent(0);

    setQueryLabel(TextStore.interface("UsgsDataImporter_Import_Progress_QueryingStarting"));
    setDownloadLabel(TextStore.interface("UsgsDataImporter_Import_Progress_DownloadingStarting"));
    setWriteLabel(TextStore.interface("UsgsDataImporter_Import_Write_Preparing"));

    try {
      await startDssWriteJobAndSubscribe();

      await runUsgsImport({
        dataFormat,
        dataType,
        name,
        desc,
        projectName,
        varieties: variety,
        selectedStations,
        startDate,
        endDate,
        retrievePor,
        timeZone,
        onProgress,
        onDataSave: props.onDataSave,
        id: props.id,
      });
    } finally {
      setIsImporting(false);

      closeWriteProgressStream();
      writeJobIdRef.current = null;
      setGlobalUsgsWriteJobId(null);
    }
  }

  function renderStep(): React.ReactNode {
    if (currentStep === 1) {
      return (
        <UsgsMetaStep
          name={name}
          desc={desc}
          dataFormat={dataFormat}
          dataType={dataType}
          startDate={startDate}
          endDate={endDate}
          retrievePor={retrievePor}
          timeZone={timeZone}
          onChangeStartDate={setStartDate}
          onChangeEndDate={setEndDate}
          onChangeRetrievePor={setRetrievePor}
          variety={variety}
          stationMode={stationMode}
          onChangeName={setName}
          onChangeDesc={setDesc}
          onChangeDataFormat={setDataFormat}
          onChangeDataType={(v) => {
            const next = v as UsgsDataType;
            setDataType(next);
            if (next === UsgsDataType.ANNUAL_PEAKS) {
              setStartDate(null);
              setEndDate(null);
              setRetrievePor(false);
            }
          }}
          onChangeVariety={setVariety}
          onChangeStationMode={setStationMode}
          onOpenStateDialog={handleOpenStateDialog}
          onChangeTimeZone={setTimeZone}
        />
      );
    }

    if (currentStep === 2) {
      return (
        <UsgsStationsStep
          stations={stations}
          retrievedStates={retrievedStates}
          onAddRow={handleAddRow}
          onChangeStationField={handleChangeStationField}
          onToggleAllImport={handleToggleAllImport}
          onDeleteRow={handleDeleteRow}
        />
      );
    }

    return null;
  }

  const dataTypeLabel = USGS_DATA_TYPE_LABELS[dataType];

  return (
    <>
      <Card withBorder radius="md" padding="md">
        <form onSubmit={(e) => e.preventDefault()} style={{ height: "100%" }}>
          <Stack gap="sm" style={{ height: "100%" }}>
            <div className="wizard-body">{renderStep()}</div>

            <div className="wizard-footer">
              <WizardNavigation
                step={currentStep}
                setStep={setCurrentStep}
                numSteps={totalSteps}
                onFinish={handleFinish}
                finishLabel={
                  isImporting
                    ? TextStore.interface("UsgsDataImporter_Importing_Button")
                    : TextStore.interface("UsgsDataImporter_Import_Button")
                }
                disableNext={!canGoNext() || isImporting}
                onCancel={isImporting ? undefined : props.onRemove}
              />
            </div>
          </Stack>
        </form>

        <UsgsStationIdsByStateDialog
          opened={stateDialogOpen}
          dataTypeLabel={dataTypeLabel}
          stateOptions={STATE_OPTIONS}
          onCancel={handleCancelStateDialog}
          onConfirm={handleStateDialogConfirm}
        />
      </Card>

      <UsgsProgressDialog
        opened={progressDialogOpen}
        queryPercent={queryPercent}
        downloadPercent={downloadPercent}
        writePercent={writePercent}
        queryLabel={queryLabel}
        downloadLabel={downloadLabel}
        writeLabel={writeLabel}
        done={progressDone}
        summary={progressSummary}
        onClose={handleProgressClose}
      />
    </>
  );
}
