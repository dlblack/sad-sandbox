import React from "react";

/**
 * WizardLayoutSidebar (text-only)
 * props:
 * - steps:        [{ label: string }]
 * - active:       number (0-based)
 * - onStepClick?: (index: number) => void
 * - title?:       ReactNode
 * - footer?:      ReactNode
 * - children:     ReactNode
 */
export default function WizardLayoutSidebar({
                                              steps = [],
                                              active = 0,
                                              onStepClick,
                                              footer,
                                              children,
                                            }) {
  return (
    <div className="wizard-shell">
      <aside className="wizard-rail" aria-label="Wizard steps">
        <ol className="wizard-rail-list">
          {steps.map((s, i) => {
            const state = i < active ? "done" : i === active ? "current" : "todo";
            const clickable = !!onStepClick && i <= active;
            return (
              <li key={i} className={`wizard-rail-item ${state}`}>
                <button
                  type="button"
                  className="wizard-rail-btn"
                  onClick={clickable ? () => onStepClick(i) : undefined}
                  aria-current={state === "current" ? "step" : undefined}
                  disabled={!clickable}
                >
                  <span className="wizard-rail-label">{s.label}</span>
                </button>
              </li>
            );
          })}
        </ol>
      </aside>

      <section className="wizard-main">
        <div className="wizard-main-inner">{children}</div>
        {footer ? <div className="wizard-footer">{footer}</div> : null}
      </section>
    </div>
  );
}
