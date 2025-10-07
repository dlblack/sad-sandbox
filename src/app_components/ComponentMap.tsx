import React, {JSX, useEffect, useRef} from "react";
import * as L from "leaflet";
import "leaflet/dist/leaflet.css";

function ComponentMap(): JSX.Element {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const resizeObsRef = useRef<ResizeObserver | null>(null);

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    const map = L.map(mapRef.current, {
      center: [38.5435, -121.7408],
      zoom: 13,
    });

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution: "© OpenStreetMap contributors",
    }).addTo(map);

    mapInstanceRef.current = map;

    const handleWinResize = () => map.invalidateSize();
    window.addEventListener("resize", handleWinResize);

    let ro: ResizeObserver | null = null;
    if (typeof ResizeObserver !== "undefined") {
      ro = new ResizeObserver(handleWinResize);
      ro.observe(mapRef.current);
      resizeObsRef.current = ro;
    }

    requestAnimationFrame(handleWinResize);

    return () => {
      window.removeEventListener("resize", handleWinResize);
      if (ro && mapRef.current) {
        try {
          ro.unobserve(mapRef.current);
          ro.disconnect();
        } catch {}
        resizeObsRef.current = null;
      }
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  return (
      <div
          ref={mapRef}
          className="map-window"
          style={{ width: "100%", height: "100%" }}
      />
  );
}

export default ComponentMap;
