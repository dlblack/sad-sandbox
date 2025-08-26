import React, {useContext, useEffect, useRef, useState} from "react";
import TimeseriesPathnameStep from "./TimeseriesPathnameStep";
import DataInfoStepCommon from "./DataInfoStepCommon.jsx";
import PairedDataTableStep from "./PairedDataTableStep";
import TimeseriesDataEntryStep from "./TimeseriesDataEntryStep.jsx";
import WizardNavigation from "../../common/WizardNavigation";
import StructureSelector from "../../editor_components/combo_boxes/StructureSelector";
import FormatSelector from "../../editor_components/combo_boxes/FormatSelector.jsx";
import PairedCurveTypeComboBox, { CURVE_TYPE_DEFAULTS } from "../../editor_components/combo_boxes/PairedCurveTypeComboBox.jsx";
import {getParamCategory} from "../../../utils/paramUtils.js";
import {toJulianDay} from "../../../utils/timeUtils.js";
import {StyleContext} from "../../../styles/StyleContext.jsx";
import {TextStore} from "../../../utils/TextStore.js";

// DSS date formatter
function formatDssDate(dateStr) {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  if (isNaN(d)) return "";
  const months = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
  const dd = String(d.getUTCDate()).padStart(2, '0');
  const mon = months[d.getUTCMonth()];
  const yyyy = d.getUTCFullYear();
  return `${dd}${mon}${yyyy}`;
}

// Default DSS file path logic
function getDefaultFilepath(parameter) {
  if (!parameter) return "";
  const key = parameter.trim().toLowerCase();
  const exceptions = {
    flow: "discharge",
    discharge: "discharge",
    "snow water equivalent": "swe",
    swe: "swe",
    "elev-stor": "elevstor",
    "stage-disch": "stagedisch",
    "freq-flow": "freqflow"
  };
  if (exceptions[key]) {
    return `public/Testing/${exceptions[key]}.dss`;
  }
  const filename = key.replace(/\s+/g, "").replace(/[^a-z0-9]/g, "");
  return `public/Testing/${filename}.dss`;
}

export default function ManualDataEntryEditor(props) {
  const {componentBackgroundStyle} = useContext(StyleContext);
  const [step, setStep] = useState(1);

  // Metadata
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  const [structureType, setStructureType] = useState(""); // "TimeSeries" or "PairedData"
  const [dataFormat, setDataFormat] = useState("DSS");    // "DSS" or "JSON"

  // Timeseries state
  const [tsPathnameParts, setTsPathnameParts] = useState({
    A: "", B: "", C: "", D: "", E: "", F: ""
  });
  const [tsParameter, setTsParameter] = useState("");
  const [tsUnits, setTsUnits] = useState("");
  const [tsInterval, setTsInterval] = useState("");
  const [tsStartDate, setTsStartDate] = useState("");
  const [tsStartTime, setTsStartTime] = useState("");
  const [tsEndDate, setTsEndDate] = useState("");
  const [tsEndTime, setTsEndTime] = useState("");
  const [tsUnitType, setTsUnitType] = useState("");
  const [tsDataRows, setTsDataRows] = useState([{dateTime: "", value: ""}]);

  // Paired data state
  const [pairedPathnameParts, setPairedPathnameParts] = useState({
    A: "", B: "", C: "", D: "", E: "", F: ""
  });
  const [pairedCurveType, setPairedCurveType] = useState("");
  const [pairedYLabel, setPairedYLabel] = useState("");
  const [pairedYUnits, setPairedYUnits] = useState("");
  const [pairedXLabel, setPairedXLabel] = useState("");
  const [pairedXUnits, setPairedXUnits] = useState("");
  const [pairedRows, setPairedRows] = useState([{x: "", y: ""}, {x: "", y: ""}, {x: "", y: ""}]);

  const prevCurveType = useRef();

  useEffect(() => {
    if (structureType !== "PairedData") return;
    if (!pairedCurveType) return;
    const defaults = CURVE_TYPE_DEFAULTS[pairedCurveType];
    if (!defaults) return;

    if (!pairedYLabel || prevCurveType.current !== pairedCurveType) setPairedYLabel(defaults.yLabel);
    if (!pairedYUnits || prevCurveType.current !== pairedCurveType) setPairedYUnits(defaults.yUnits);
    if (!pairedXLabel || prevCurveType.current !== pairedCurveType) setPairedXLabel(defaults.xLabel);
    if (!pairedXUnits || prevCurveType.current !== pairedCurveType) setPairedXUnits(defaults.xUnits);
    prevCurveType.current = pairedCurveType;
  }, [pairedCurveType, structureType]);

  useEffect(() => {
    setTsPathnameParts(parts => ({
      ...parts,
      C: tsParameter || "",
      D: tsStartDate ? formatDssDate(tsStartDate) : "",
      E: tsInterval || ""
    }));
  }, [tsParameter, tsStartDate, tsInterval]);

  useEffect(() => {
    if (structureType === "PairedData") {
      setPairedPathnameParts(parts => ({...parts, D: ""}));
    }
  }, [structureType]);

  function renderStep() {
    if (step === 1) {
      return (
        <div className="manual-entry-content" style={{maxWidth: 480}}>
          <legend>{TextStore.interface("ManualDataEntryEditor_Legend")}</legend>
          <hr/>
          <div className="mb-2 d-flex align-items-center">
            <label className="form-label font-xs me-2" style={{minWidth: 90, textAlign: "left"}}>
              {TextStore.interface("ManualDataEntryEditor_Name")}
            </label>
            <input className="form-control form-control-sm" style={{flex: 1}}
                   value={name} onChange={e => setName(e.target.value)}
                   maxLength={64} required
            />
          </div>
          <div className="mb-2 d-flex align-items-center">
            <label className="form-label font-xs me-2" style={{minWidth: 90, textAlign: "left"}}>
              {TextStore.interface("ManualDataEntryEditor_Description")}
            </label>
            <textarea className="form-control form-control-sm" style={{flex: 1}}
                      value={desc} onChange={e => setDesc(e.target.value)}
                      maxLength={256} rows={2}
            />
          </div>
          <hr/>
          <StructureSelector value={structureType} onChange={setStructureType}/>
          <FormatSelector value={dataFormat} onChange={setDataFormat}/>
        </div>
      );
    }

    // Step 2: TimeSeries (DSS or JSON)
    if (step === 2 && structureType === "TimeSeries") {
      return (
        <div>
          {dataFormat === "DSS" && (
            <TimeseriesPathnameStep
              pathnameParts={tsPathnameParts}
              setPathnameParts={setTsPathnameParts}
              editableParts={{A: true, B: true, C: true, D: true, E: true, F: true}}
            />
          )}
          <DataInfoStepCommon
            showParameterCombo={true}
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

    // Step 2: PairedData (DSS or JSON)
    if (step === 2 && structureType === "PairedData") {
      if (dataFormat === "DSS") {
        return (
          <div>
            <TimeseriesPathnameStep
              pathnameParts={pairedPathnameParts}
              setPathnameParts={parts => setPairedPathnameParts({...parts, D: ""})}
              editableParts={{A: true, B: true, C: true, D: false, E: true, F: true}}
            />
            {/* Curve type, units, labels as before */}
            <div className="mb-2 d-flex align-items-center">
              <label className="form-label font-xs me-2" style={{minWidth: 90, textAlign: "left"}}>
                {TextStore.interface("ManualDataEntryEditor_CurveType")}
              </label>
              <PairedCurveTypeComboBox value={pairedCurveType} onChange={val => {
                setPairedCurveType(val);
                setPairedPathnameParts(parts => ({...parts, C: val}));
              }}/>
            </div>
            <div className="mb-2 d-flex align-items-center">
              <label className="form-label font-xs me-2" style={{minWidth: 90, textAlign: "left"}}>
                {TextStore.interface("ManualDataEntryEditor_YLabel")}
              </label>
              <input className="form-control font-xs"
                     value={pairedXLabel}
                     onChange={e => setPairedYLabel(e.target.value)}
              />
            </div>
            <div className="mb-2 d-flex align-items-center">
              <label className="form-label font-xs me-2" style={{minWidth: 90, textAlign: "left"}}>
                {TextStore.interface("ManualDataEntryEditor_YUnits")}
              </label>
              <input className="form-control font-xs"
                     value={pairedYUnits}
                     onChange={e => setPairedYUnits(e.target.value)}
              />
            </div>
            <div className="mb-2 d-flex align-items-center">
              <label className="form-label font-xs me-2" style={{minWidth: 90, textAlign: "left"}}>
                {TextStore.interface("ManualDataEntryEditor_XLabel")}
              </label>
              <input className="form-control font-xs"
                     value={pairedXLabel}
                     onChange={e => setPairedXLabel(e.target.value)}
              />
            </div>
            <div className="mb-2 d-flex align-items-center">
              <label className="form-label font-xs me-2" style={{minWidth: 90, textAlign: "left"}}>
                {TextStore.interface("ManualDataEntryEditor_XUnits")}
              </label>
              <input className="form-control font-xs"
                     value={pairedXUnits}
                     onChange={e => setPairedXUnits(e.target.value)}
              />
            </div>
          </div>
        );
      } else if (dataFormat === "JSON") {
        return (
          <div>
            {/* No pathname step for JSON */}
            <div className="mb-2 d-flex align-items-center">
              <label className="form-label font-xs me-2" style={{minWidth: 90, textAlign: "left"}}>
                {TextStore.interface("ManualDataEntryEditor_CurveType")}
              </label>
              <PairedCurveTypeComboBox value={pairedCurveType} onChange={setPairedCurveType}/>
            </div>
            <div className="mb-2 d-flex align-items-center">
              <label className="form-label font-xs me-2" style={{minWidth: 90, textAlign: "left"}}>
                {TextStore.interface("ManualDataEntryEditor_YLabel")}
              </label>
              <input className="form-control font-xs"
                     value={pairedYLabel}
                     onChange={e => setPairedYLabel(e.target.value)}
              />
            </div>
            <div className="mb-2 d-flex align-items-center">
              <label className="form-label font-xs me-2" style={{minWidth: 90, textAlign: "left"}}>
                {TextStore.interface("ManualDataEntryEditor_YUnits")}
              </label>
              <input className="form-control font-xs"
                     value={pairedYUnits}
                     onChange={e => setPairedYUnits(e.target.value)}
              />
            </div>
            <div className="mb-2 d-flex align-items-center">
              <label className="form-label font-xs me-2" style={{minWidth: 90, textAlign: "left"}}>
                {TextStore.interface("ManualDataEntryEditor_XLabel")}
              </label>
              <input className="form-control font-xs"
                     value={pairedXLabel}
                     onChange={e => setPairedXLabel(e.target.value)}
              />
            </div>
            <div className="mb-2 d-flex align-items-center">
              <label className="form-label font-xs me-2" style={{minWidth: 90, textAlign: "left"}}>
                {TextStore.interface("ManualDataEntryEditor_XUnits")}
              </label>
              <input className="form-control font-xs"
                     value={pairedXUnits}
                     onChange={e => setPairedXUnits(e.target.value)}
              />
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
          onBack={() => setStep(2)}
          onNext={() => setStep(4)}
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

    // Step 4: Confirmation (optional)
    if (step === 4) {
      const {A, B, C, E, F} = pairedPathnameParts;
      const pairedPathname = `/${A || ""}/${B || ""}/${C || ""}//${E || ""}/${F || ""}/`;
      return (
        <div>
          <h6>{TextStore.interface("ManualDataEntryEditor_Summary")}</h6>
          <div className="my-2 font-xs">
            <strong>{TextStore.interface("ManualDataEntryEditor_SummaryName")}</strong>
            {name}
          </div>
          <div className="my-2 font-xs">
            <strong>
            {TextStore.interface("ManualDataEntryEditor_SummaryDescription")}</strong>
            {desc}
          </div>
          <div className="my-2 font-xs">
            <strong>{TextStore.interface("ManualDataEntryEditor_SummaryStructureType")}</strong>
            {structureType}
          </div>
          <div className="my-2 font-xs">
            <strong>{TextStore.interface("ManualDataEntryEditor_SummaryDataFormat")}</strong>
            {dataFormat}
          </div>
          {structureType === "TimeSeries" && (
            <>
              <div style={{maxHeight: 160, overflow: "auto"}}>
                <table className="table table-bordered table-sm" style={{maxWidth: 340}}>
                  <thead>
                  <tr>
                    <th style={{width: 160}}>
                      {TextStore.interface("ManualDataEntryEditor_SummaryDateTime")}
                    </th>
                    <th style={{width: 80}}>
                      {TextStore.interface("ManualDataEntryEditor_SummaryValue")}
                    </th>
                  </tr>
                  </thead>
                  <tbody>
                  {tsDataRows
                    .filter(row => row.dateTime && row.value !== "")
                    .map((row, i) => (
                      <tr key={i}>
                        <td>{row.dateTime}</td>
                        <td>{row.value}</td>
                      </tr>
                    ))
                  }
                  </tbody>
                </table>
              </div>
            </>
          )}
          {structureType === "PairedData" && (
            <>
              <div className="my-2 font-xs">
                <strong>{TextStore.interface("ManualDataEntryEditor_SummaryFilepath")}</strong>
                {getDefaultFilepath(pairedCurveType)}
              </div>
              <div className="my-2 font-xs">
                <strong>{TextStore.interface("ManualDataEntryEditor_SummaryPathname")}</strong>
                {pairedPathname}
              </div>
              <div className="my-2 font-xs">
                <strong>{TextStore.interface("ManualDataEntryEditor_SummaryCurveType")}</strong>
                {pairedCurveType}
              </div>
              <div className="my-2 font-xs">
                <strong>{TextStore.interface("ManualDataEntryEditor_SummaryYUnits")}</strong>
                {pairedYUnits}
              </div>
              <div className="my-2 font-xs">
                <strong>{TextStore.interface("ManualDataEntryEditor_SummaryXLabel")}</strong>
                {pairedXLabel}
              </div>
              <div className="my-2 font-xs">
                <strong>{TextStore.interface("ManualDataEntryEditor_SummaryXUnits")}</strong>
                {pairedXUnits}
              </div>
              <div style={{maxHeight: 160, overflow: "auto"}}>
                <table className="table table-bordered table-sm font-sm" style={{maxWidth: 380}}>
                  <thead>
                  <tr>
                    <th className="font-xs" style={{width: 80}}>#</th>
                    <th className="font-xs" style={{width: 120}}>{pairedXLabel || "X"}</th>
                    <th className="font-xs" style={{width: 120}}>{pairedCurveType || "Y"}</th>
                  </tr>
                  </thead>
                  <tbody>
                  {pairedRows
                    .filter(row => row.x && row.y !== "")
                    .map((row, idx) => (
                      <tr key={idx}>
                        <td className="font-xs">{idx + 1}</td>
                        <td className="font-xs">{row.x}</td>
                        <td className="font-xs">{row.y}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      );
    }
  }

  // Save logic
  function handleWizardFinish(e) {
    if (e) e.preventDefault();

    // TimeSeries
    if (structureType === "TimeSeries" && props.onDataSave) {
      const {A, B, C, D, E, F} = tsPathnameParts;
      const pathname = `/${A || ""}/${B || ""}/${C || ""}/${D || ""}/${E || ""}/${F || ""}/`;
      const dataRowsFiltered = tsDataRows.filter(
        row => row.value !== "" && !isNaN(Number(row.value)) && row.dateTime !== ""
      );
      const values = dataRowsFiltered.map(row => Number(row.value));
      const dateTimes = dataRowsFiltered.map(row => row.dateTime);
      const paramCategory = getParamCategory(tsParameter);
      const filepath = getDefaultFilepath(tsParameter);

      let payload = {
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
          times: dateTimes.map(dtStr => toJulianDay(new Date(dtStr))),
        };
      } else {
        payload = {
          ...payload,
          times: dateTimes,
        };
      }

      props.onDataSave(paramCategory, payload, props.id);
      if (props.onRemove) props.onRemove();
    }

    if (structureType === "PairedData" && dataFormat === "DSS" && props.onDataSave) {
      const {A, B, C, E, F} = pairedPathnameParts;
      const pathname = `/${A || ""}/${B || ""}/${C || ""}//${E || ""}/${F || ""}/`;

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
        filepath: getDefaultFilepath(pairedCurveType),
        pathname,
      };

      const xValues = pairedRows.filter(r => r.x !== "" && r.y !== "")
        .map(r => Number(r.x));
      const yValues = pairedRows.filter(r => r.x !== "" && r.y !== "")
        .map(r => Number(r.y));

      props.onDataSave(pairedCurveType, {...payload, xValues, yValues}, props.id);
      if (props.onRemove) props.onRemove();
    }

    // PairedData JSON: store full table of rows
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
        rows: pairedRows.filter(r => r.x !== "" && r.y !== "")
      };

      props.onDataSave(pairedCurveType, payload, props.id);
      if (props.onRemove) props.onRemove();
    }
  }

  const numSteps = 4;

  function canGoNext() {
    if (step === 1) return !!name.trim() && !!structureType && !!dataFormat;
    if (step === 2 && structureType === "TimeSeries") {
      return (
        !!tsParameter && !!tsUnits && !!tsUnitType &&
        !!tsStartDate && !!tsStartTime && !!tsEndDate && !!tsEndTime
      );
    }
    if (step === 2 && structureType === "PairedData") {
      if (dataFormat === "DSS") {
        const {C} = pairedPathnameParts;
        return !!C && !!pairedCurveType && !!pairedYUnits && !!pairedXLabel && !!pairedXUnits;
      } else if (dataFormat === "JSON") {
        return !!pairedCurveType && !!pairedYUnits && !!pairedXLabel && !!pairedXUnits;
      }
    }
    if (step === 3 && structureType === "TimeSeries") {
      return tsDataRows.some(row => row.value !== "");
    }
    if (step === 3 && structureType === "PairedData") {
      return pairedRows.some(row => row.x !== "" && row.y !== "");
    }
    return true;
  }

  return (
    <div className={`wizard-fixed-size card p-3 ${componentBackgroundStyle}`}>
      <form className="d-flex flex-column h-100" onSubmit={e => e.preventDefault()}>
        <div className="flex-grow-1 d-flex flex-column" style={{minHeight: 0}}>
          {renderStep()}
        </div>
        <div className="wizard-footer">
          <WizardNavigation
            step={step}
            setStep={setStep}
            numSteps={numSteps}
            onFinish={handleWizardFinish}
            finishLabel="Create"
            disableNext={!canGoNext()}
          />
        </div>
      </form>
    </div>
  );
}
