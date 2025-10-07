import React, { useMemo, useState } from "react";

function useColorScheme() {
  const scheme = document?.documentElement?.getAttribute?.("data-mantine-color-scheme");
  return scheme === "light" ? "light" : "dark";
}

export default function TabCloseButton({
                                         title = "Close",
                                         onClick,
                                         style,
                                         size = 18,
                                       }) {
  const [hover, setHover] = useState(false);
  const [active, setActive] = useState(false);
  const scheme = useColorScheme();

  const d = size;

  const { bg, ring } = useMemo(() => {
    // Subtle neutral based on scheme; no hard-coded brand color
    const bgLight = "rgba(0,0,0,.06)";
    const bgDark  = "rgba(255,255,255,.08)";
    const ringLight = "rgba(0,0,0,.10)";
    const ringDark  = "rgba(255,255,255,.12)";
    const baseBg  = scheme === "light" ? bgLight : bgDark;
    const baseRing = scheme === "light" ? ringLight : ringDark;

    return {
      bg: hover ? baseBg : "transparent",
      ring: hover ? `0 0 0 1px ${baseRing}` : "none",
    };
  }, [hover, scheme]);

  return (
    <span
      role="button"
      aria-label={title}
      title={title}
      tabIndex={0}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => { setHover(false); setActive(false); }}
      onMouseDown={(e) => { e.stopPropagation(); setActive(true); }}
      onMouseUp={() => setActive(false)}
      onClick={(e) => { e.stopPropagation(); onClick?.(e); }}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onClick?.(e); }
      }}
      className="tab-close-btn"
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        width: d,
        height: d,
        borderRadius: 9999,
        lineHeight: 1,
        cursor: "pointer",
        userSelect: "none",
        color: "inherit",
        background: active ? bg : bg,
        boxShadow: ring,
        transition: "background .12s ease, box-shadow .12s ease, transform .05s ease",
        transform: active ? "scale(0.96)" : "none",
        ...style,
      }}
    >
      ×
    </span>
  );
}
