import React from "react";
import {
  Button,
  Checkbox,
  Group,
  SegmentedControl,
  Stack,
  Textarea,
  TextInput,
  Title,
} from "@mantine/core";
import { DateInput } from "@mantine/dates";
import FormatSelector from "../../editor_components/combo_boxes/FormatSelector";
import { TextStore } from "../../../utils/TextStore";
import type { StationSourceMode } from "./UsgsDataImporter";
import { UsgsDataType } from "../../../api/usgs/io/UsgsDataType";
import { DataFormat } from "./usgsImportLogic";
import { TimeSeriesType } from "../../../timeSeries/timeSeriesType";
import { UsgsTimeZone } from "../../../api/usgsApi";

export type UsgsMetaStepProps = {
  name: string;
  desc: string;
  dataFormat: DataFormat;
  dataType: UsgsDataType;
  startDate: Date | null;
  endDate: Date | null;
  retrievePor: boolean;
  timeZone: UsgsTimeZone;

  variety: TimeSeriesType[];
  stationMode: StationSourceMode;

  onChangeName: (v: string) => void;
  onChangeDesc: (v: string) => void;
  onChangeDataFormat: (v: DataFormat) => void;
  onChangeDataType: (v: UsgsDataType) => void;

  onChangeStartDate: (value: Date | null) => void;
  onChangeEndDate: (value: Date | null) => void;
  onChangeRetrievePor: (value: boolean) => void;
  onChangeTimeZone: (value: UsgsTimeZone) => void;

  onChangeVariety: (v: TimeSeriesType[]) => void;
  onChangeStationMode: (v: StationSourceMode) => void;

  onOpenStateDialog: () => void;
};

function isoDateStringFromDate(date: Date | null): string | null {
  if (!date) return null;
  return date.toISOString().slice(0, 10);
}

function dateFromIsoDateString(value: string | null): Date | null {
  if (!value) return null;
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return null;
  return parsed;
}

function uniqueSeriesTypesOrDefault(next: TimeSeriesType[]): TimeSeriesType[] {
  const unique = Array.from(new Set(next));
  return unique.length ? unique : [TimeSeriesType.FLOW];
}

export default function UsgsMetaStep(props: UsgsMetaStepProps) {
  const {
    name,
    desc,
    dataFormat,
    dataType,
    variety,
    stationMode,
    startDate,
    endDate,
    retrievePor,
    timeZone,
    onChangeStartDate,
    onChangeEndDate,
    onChangeRetrievePor,
    onChangeName,
    onChangeDesc,
    onChangeDataFormat,
    onChangeDataType,
    onChangeVariety,
    onChangeStationMode,
    onOpenStateDialog,
    onChangeTimeZone,
  } = props;

  const isAnnualPeaks = dataType === UsgsDataType.ANNUAL_PEAKS;
  const isDaily = dataType === UsgsDataType.DAILY;

  const datesDisabled = isAnnualPeaks;
  const porDisabled = !isDaily;
  const timeZoneDisabled = isAnnualPeaks;

  const startInputValue = isoDateStringFromDate(startDate);
  const endInputValue = isoDateStringFromDate(endDate);

  const hasFlowSelected = variety.includes(TimeSeriesType.FLOW);
  const hasStageSelected = variety.includes(TimeSeriesType.STAGE);

  function updateSelectedSeriesTypes(next: TimeSeriesType[]) {
    onChangeVariety(uniqueSeriesTypesOrDefault(next));
  }

  function handleFlowCheckedChange(checked: boolean) {
    if (checked) {
      updateSelectedSeriesTypes(hasFlowSelected ? variety : [...variety, TimeSeriesType.FLOW]);
    } else {
      updateSelectedSeriesTypes(variety.filter((t) => t !== TimeSeriesType.FLOW));
    }
  }

  function handleStageCheckedChange(checked: boolean) {
    if (checked) {
      updateSelectedSeriesTypes(hasStageSelected ? variety : [...variety, TimeSeriesType.STAGE]);
    } else {
      updateSelectedSeriesTypes(variety.filter((t) => t !== TimeSeriesType.STAGE));
    }
  }

  return (
    <div className="manual-entry-content">
      <Title size="h4">
        {TextStore.interface("ManualDataEntryEditor_Legend") ?? "USGS Data Import"}
      </Title>

      <div className="manual-entry-row">
        <label className="manual-entry-label">
          {TextStore.interface("UsgsDataImporter_Name")}
        </label>
        <div className="manual-entry-field">
          <TextInput
            size="sm"
            value={name}
            onChange={(e) => onChangeName(e.currentTarget.value)}
            maxLength={64}
            required
          />
        </div>
      </div>

      <div className="manual-entry-row">
        <label className="manual-entry-label">
          {TextStore.interface("UsgsDataImporter_Description")}
        </label>
        <div className="manual-entry-field">
          <Textarea
            size="sm"
            value={desc}
            onChange={(e) => onChangeDesc(e.currentTarget.value)}
            autosize
            minRows={2}
            maxRows={4}
          />
        </div>
      </div>

      <div className="manual-entry-row">
        <div className="manual-entry-field">
          <FormatSelector
            value={dataFormat}
            onChange={(v) => {
              if (!v) return;
              onChangeDataFormat(v as DataFormat);
            }}
          />
        </div>
      </div>

      <div className="manual-entry-row">
        <label className="manual-entry-label">
          {TextStore.interface("UsgsDataImporter_DataType_Label")}
        </label>
        <div className="manual-entry-field">
          <SegmentedControl
            size="xs"
            value={dataType}
            onChange={(v) => onChangeDataType(v as UsgsDataType)}
            data={[
              {
                value: UsgsDataType.ANNUAL_PEAKS,
                label: TextStore.interface("UsgsDataImporter_DataType_AnnualPeakData"),
              },
              {
                value: UsgsDataType.DAILY,
                label: TextStore.interface("UsgsDataImporter_DataType_Daily"),
              },
              {
                value: UsgsDataType.INSTANTANEOUS,
                label: TextStore.interface("UsgsDataImporter_DataType_Instantaneous"),
              },
            ]}
          />
        </div>
      </div>

      <div className="manual-entry-row">
        <label className="manual-entry-label">
          {TextStore.interface("UsgsDataImporter_DateRange_Label")}
        </label>
        <div className="manual-entry-field">
          <Stack gap="xs">
            <Group align="flex-end" gap="xs">
              <DateInput
                label={TextStore.interface("UsgsDataImporter_StartDate")}
                size="xs"
                value={startInputValue}
                onChange={(value) => onChangeStartDate(dateFromIsoDateString(value))}
                disabled={datesDisabled}
                clearable
              />
              <DateInput
                label={TextStore.interface("UsgsDataImporter_EndDate")}
                size="xs"
                value={endInputValue}
                onChange={(value) => onChangeEndDate(dateFromIsoDateString(value))}
                disabled={datesDisabled}
                clearable
              />
            </Group>

            <Checkbox
              size="xs"
              checked={retrievePor}
              onChange={(e) => onChangeRetrievePor(e.currentTarget.checked)}
              disabled={porDisabled}
              label={TextStore.interface("UsgsDataImporter_RetrievePor")}
            />
          </Stack>
        </div>
      </div>

      <div className="manual-entry-row">
        <label className="manual-entry-label">
          {TextStore.interface("UsgsDataImporter_TimeZone_Label")}
        </label>
        <div className="manual-entry-field">
          <SegmentedControl
            size="xs"
            value={timeZone}
            disabled={timeZoneDisabled}
            onChange={(v) => onChangeTimeZone(v as UsgsTimeZone)}
            data={[
              {
                value: "UTC",
                label: TextStore.interface("UsgsDataImporter_TimeZone_UTC"),
              },
              {
                value: "LOCAL_STANDARD",
                label: TextStore.interface("UsgsDataImporter_TimeZone_LocalStandard"),
              },
            ]}
          />
        </div>
      </div>

      <div className="manual-entry-row">
        <label className="manual-entry-label">
          {TextStore.interface("UsgsDataImporter_Variety_Label")}
        </label>
        <div className="manual-entry-field">
          <Group gap="md">
            <Checkbox
              size="xs"
              checked={hasFlowSelected}
              onChange={(e) => handleFlowCheckedChange(e.currentTarget.checked)}
              label={TextStore.interface("UsgsDataImporter_Variety_Flow")}
            />
            <Checkbox
              size="xs"
              checked={hasStageSelected}
              onChange={(e) => handleStageCheckedChange(e.currentTarget.checked)}
              label={TextStore.interface("UsgsDataImporter_Variety_Stage")}
            />
          </Group>
        </div>
      </div>

      <div className="manual-entry-row">
        <label className="manual-entry-label">
          {TextStore.interface("UsgsDataImporter_StationID_Label")}
        </label>
        <div className="manual-entry-field">
          <SegmentedControl
            size="xs"
            value={stationMode}
            onChange={(v) => onChangeStationMode(v as StationSourceMode)}
            data={[
              {
                value: "manual",
                label: TextStore.interface("UsgsDataImporter_StationID_Manual"),
              },
              {
                value: "byState",
                label: TextStore.interface("UsgsDataImporter_StationID_Auto"),
              },
            ]}
          />
          {stationMode === "byState" && (
            <Group justify="flex-start">
              <Button size="xs" onClick={onOpenStateDialog}>
                {TextStore.interface("UsgsDataImporter_GetStations_Button")}
              </Button>
            </Group>
          )}
        </div>
      </div>
    </div>
  );
}
