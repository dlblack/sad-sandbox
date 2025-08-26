import React from 'react';
import { TextStore } from "../../../utils/TextStore";

export default function TimeseriesPathnameStep({
                                                 pathnameParts, setPathnameParts
                                               }) {
  function handlePartChange(part, val) {
    setPathnameParts({...pathnameParts, [part]: val});
  }

  return (
    <div>
      <h5>Define DSS Pathname Parts</h5>
      <div className="pathname-section p-1 border rounded mb-3" style={{width: "100%"}}>
        <div className="font-xs mb-2">Pathname Parts</div>
        <div className="compact-field d-flex gap-1 mb-1 flex-nowrap">
          {[
            TextStore.interface("ManualDataEntryEditor_TimeseriesPathname_A"),
            TextStore.interface("ManualDataEntryEditor_TimeseriesPathname_B")
          ].map(part => (
            <div className="d-flex align-items-center flex-grow-1" key={part}>
              <label className="form-label font-xs compact-label mb-0 me-1" style={{minWidth: 16}}>{part}</label>
              <input
                className="form-control form-control-sm"
                maxLength={50}
                value={pathnameParts[part] || ""}
                onChange={e => handlePartChange(part, e.target.value)}
              />
            </div>
          ))}

          <div className="compact-field d-flex align-items-center flex-grow-1">
            <label
              className="form-label font-xs compact-label mb-0 me-1"
              style={{minWidth: 16}}>{TextStore.interface("ManualDataEntryEditor_TimeseriesPathname_C")}
            </label>
            <input
              className="form-control form-control-sm"
              maxLength={50}
              value={pathnameParts[TextStore.interface("ManualDataEntryEditor_TimeseriesPathname_C")] || ""}
              readOnly
              tabIndex={-1}
              style={{backgroundColor: "#f9f9f9"}}
            />
          </div>
        </div>
        <div className="compact-field d-flex gap-1 mb-1 flex-nowrap">
          {
            [
              TextStore.interface("ManualDataEntryEditor_TimeseriesPathname_D"),
              TextStore.interface("ManualDataEntryEditor_TimeseriesPathname_E")
            ].map(part => (
            <div className="d-flex align-items-center flex-grow-1" key={part}>
              <label className="form-label font-xs compact-label mb-0 me-1" style={{minWidth: 16}}>{part}</label>
              <input
                className="form-control form-control-sm"
                maxLength={50}
                value={pathnameParts[part] || ""}
                readOnly
                tabIndex={-1}
                style={{backgroundColor: "#f9f9f9"}}
              />
            </div>
          ))}
          {/* Editable: F */}
          <div className="compact-field d-flex align-items-center flex-grow-1">
            <label
              className="form-label font-xs compact-label mb-0 me-1"
              style={{minWidth: 16}}>{TextStore.interface("ManualDataEntryEditor_TimeseriesPathname_F")}
            </label>
            <input
              className="form-control form-control-sm"
              maxLength={50}
              value={pathnameParts[TextStore.interface("ManualDataEntryEditor_TimeseriesPathname_F")] || ""}
              onChange={e => handlePartChange(
                TextStore.interface("ManualDataEntryEditor_TimeseriesPathname_F"), e.target.value)}
            />
          </div>
        </div>
        <div className="d-flex align-items-center mb-1 w-100">
          <label
            className="form-label font-xs me-2 mb-0"
            style={{minWidth: 70}}
          >
            {TextStore.interface("ManualDataEntryEditor_Pathname")}
          </label>
          <input
            className="form-control form-control-sm flex-grow-1"
            value={`/${
              [
                TextStore.interface("ManualDataEntryEditor_TimeseriesPathname_A"), 
                TextStore.interface("ManualDataEntryEditor_TimeseriesPathname_B"), 
                TextStore.interface("ManualDataEntryEditor_TimeseriesPathname_C"), 
                TextStore.interface("ManualDataEntryEditor_TimeseriesPathname_D"), 
                TextStore.interface("ManualDataEntryEditor_TimeseriesPathname_E"), 
                TextStore.interface("ManualDataEntryEditor_TimeseriesPathname_F"),
              ]
                .map((p) => pathnameParts[p] || "").join("/")}/`}
            readOnly
          />
        </div>
      </div>
    </div>
  );
}
