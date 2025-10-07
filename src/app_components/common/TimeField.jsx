import React, { useEffect, useRef, useState } from "react";
import { normalizeTimeInput } from "../../utils/timeUtils.js";

export default function TimeField24({
                                      value = "",
                                      onChange,
                                      minuteStep = 1,
                                      className = "",
                                      style,
                                      ...props
                                    }) {
  const [raw, setRaw] = useState(value || "");
  const [open, setOpen] = useState(false);
  const wrapRef = useRef(null);

  useEffect(() => setRaw(value || ""), [value]);

  // close popover on outside click
  useEffect(() => {
    const onDoc = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  const commit = (v) => {
    const norm = normalizeTimeInput(v);
    setRaw(norm);
    onChange?.(norm);
  };

  // current parsed hour/min (safe defaults)
  const curH = Math.max(0, Math.min(23, parseInt(raw.slice(0, 2), 10) || 0));
  const curM = Math.max(0, Math.min(59, parseInt(raw.slice(3, 5), 10) || 0));

  const hours = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, "0"));
  const minutes = Array.from(
    { length: Math.ceil(60 / minuteStep) },
    (_, i) => String(i * minuteStep).padStart(2, "0")
  );

  const pickHour = (hr) => {
    const next = `${hr}:${String(curM).padStart(2, "0")}`;
    setRaw(next);
    onChange?.(next);
  };

  const pickMinute = (mn) => {
    const next = `${String(curH).padStart(2, "0")}:${mn}`;
    setRaw(next);
    onChange?.(next);
    setOpen(false);
  };

  function ClockIcon({ size = 14, stroke = 1.5 }) {
    return (
      <svg
        width={size} height={size} viewBox="0 0 16 16"
        fill="none" stroke="currentColor" strokeWidth={stroke}
        strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"
      >
        <circle cx="8" cy="8" r="6.25" />
        <path d="M8 4.5v3l2 1.25" />
      </svg>
    );
  }

  return (
    <div
      ref={wrapRef}
      className="tf-wrap"
      style={{
        position: "relative",
        display: "inline-block",
        width: "max-content",
        justifySelf: "start"
      }}
    >
      <input
        {...props}
        type="text"
        inputMode="numeric"
        pattern="([01]\\d|2[0-3]):[0-5]\\d"
        placeholder="HH:MM"
        className={className}
        style={{ width: "50ch", paddingRight: "2rem", ...(style || {}) }}
        value={raw}
        onChange={(e) => setRaw(e.target.value)}
        onBlur={(e) => commit(e.target.value)}
        onKeyDown={(e) => { if (e.key === "Escape") setOpen(false); }}
      />

      <button
        type="button"
        className="tf24-toggle"
        aria-label="Pick time"
        onClick={() => setOpen(v => !v)}
        style={{
          position: "absolute",
          right: "0.375rem",
          top: "50%",
          transform: "translateY(-50%)",
          zIndex: 3,
          border: "none",
          background: "transparent",
          padding: 0,
          width: "1.5rem",
          height: "1.5rem",
          cursor: "pointer",
          lineHeight: 0,
          color: "var(--bs-secondary-color, #000)"
        }}
      >
        <ClockIcon size={9} stroke={2} />
      </button>

      {open && (
        <div
          className="tf-popover"
          role="dialog"
          style={{
            position: "absolute",
            zIndex: 9999,
            right: 0,
            marginTop: 6,
            background: "var(--bs-body-bg, #1e1e1e)",
            color: "inherit",
            border: "1px solid var(--bs-border-color, #444)",
            borderRadius: 6,
            boxShadow: "0 8px 24px rgba(0,0,0,.35)",
            padding: 8
          }}
        >
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            {/* Hours column */}
            <div className="tf-col">
              <div className="tf-head" style={{ textAlign: "center", fontSize: 12, opacity: 0.7 }}>
                Hours
              </div>
              <div className="tf-list" style={{ maxHeight: 180, overflow: "auto" }}>
                {hours.map((hr) => (
                  <button
                    key={hr}
                    type="button"
                    className={`tf-item${hr === String(curH).padStart(2, "0") ? " is-active" : ""}`}
                    onClick={() => pickHour(hr)}
                    style={itemStyle}
                  >
                    {hr}
                  </button>
                ))}
              </div>
            </div>

            {/* Minutes column */}
            <div className="tf-col">
              <div className="tf-head" style={{ textAlign: "center", fontSize: 12, opacity: 0.7 }}>
                Minutes
              </div>
              <div className="tf-list" style={{ maxHeight: 180, overflow: "auto" }}>
                {minutes.map((mn) => (
                  <button
                    key={mn}
                    type="button"
                    className={`tf-item${mn === String(curM).padStart(2, "0") ? " is-active" : ""}`}
                    onClick={() => pickMinute(mn)}
                    style={itemStyle}
                  >
                    {mn}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .tf-item{ display:block; width:3rem; height:1.75rem; border-radius:6px; border:1px solid transparent; background:transparent; cursor:pointer; margin:2px auto; }
        .tf-item:hover{ border-color: var(--bs-primary, #0d6efd); }
        .tf-item.is-active{ background: var(--bs-primary, #0d6efd); color:#fff; }
      `}</style>
    </div>
  );
}

const itemStyle = {
  textAlign: "center",
  fontVariantNumeric: "tabular-nums",
};
