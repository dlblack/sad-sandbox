import React from "react";
import { useUISizing } from "../uiSizing.jsx";
import {TextStore} from "../utils/TextStore.js";

const DENSITY_PRESETS = [
  { label: TextStore.interface("ComponentInterfaceSize_Density_Compact"), value: 0.90 },
  { label: TextStore.interface("ComponentInterfaceSize_Density_Standard"), value: 1.00 },
  { label: TextStore.interface("ComponentInterfaceSize_Density_Comfy"), value: 1.15 },
];

export default function ComponentInterfaceSize() {
  const { scale, density, setScalePercent, setDensity, bumpScale, reset } = useUISizing();
  const currentPercent = Math.round(scale * 100);

  const densityName =
    density === 1
      ? TextStore.interface("ComponentInterfaceSize_Density_Standard")
      : density < 1
        ? TextStore.interface("ComponentInterfaceSize_Density_Compact")
        : TextStore.interface("ComponentInterfaceSize_Density_Comfy");

  return (
    <div className="card text-white mb-2">
      <div className="p-3" style={{ minWidth: 320 }}>
        {/* Header */}
        <div className="d-flex align-items-center justify-content-between mb-2">
          <h6 className="m-0">
            {TextStore.interface("ComponentInterfaceSize_HeaderPrefix")} {currentPercent}% · {densityName}
          </h6>
        </div>

        {/* Scale row */}
        <div className="mb-3">
          <div className="d-flex align-items-center gap-2">
            <button
              type="button"
              className="btn btn-outline-secondary btn-sm"
              onClick={() => bumpScale(-10)}
              title={TextStore.interface("ComponentInterfaceSize_Decrease")}
            >
              -10%
            </button>

            <input
              type="range"
              min={60}
              max={200}
              step={5}
              value={currentPercent}
              className="form-range flex-grow-1"
              onChange={(e) => setScalePercent(Number(e.target.value))}
              aria-label={TextStore.interface("ComponentInterfaceSize_Slider_Aria")}
            />

            <button
              type="button"
              className="btn btn-outline-secondary btn-sm"
              onClick={() => bumpScale(+10)}
              title={TextStore.interface("ComponentInterfaceSize_Increase")}
            >
              +10%
            </button>
          </div>

          <div className="mt-2 text-end">
            <button
              type="button"
              className="btn btn-sm btn-outline-warning"
              onClick={() => reset()}
              title={TextStore.interface("ComponentInterfaceSize_ResetTitle")}
            >
              {TextStore.interface("ComponentInterfaceSize_ResetButton")}
            </button>
          </div>
        </div>

        {/* Density row */}
        <div>
          <div className="mb-2">
            <strong>
              {TextStore.interface("ComponentInterfaceSize_Density")}
            </strong>
          </div>
          <div className="btn-group" role="group" aria-label="Density selection">
            {DENSITY_PRESETS.map(({ label, value }) => {
              const active = Math.abs(value - density) < 0.01;
              return (
                <button
                  key={label}
                  type="button"
                  className={`btn btn-sm ${
                    active ? "btn-primary" : "btn-outline-secondary"
                  }`}
                  onClick={() => setDensity(value)}
                  aria-pressed={active}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
