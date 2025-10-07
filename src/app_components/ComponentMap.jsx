import React, {useEffect, useRef} from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

function ComponentMap() {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const resizeObsRef = useRef(null);

  useEffect(() => {
    if (mapRef.current && !mapInstanceRef.current) {
      const map = L.map(mapRef.current, {
        center: [38.5435, -121.7408],
        zoom: 13,
      });

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
        attribution: "© OpenStreetMap contributors",
      }).addTo(map);

      mapInstanceRef.current = map;

      // Keep Leaflet canvas in sync when parent resizes or becomes visible
      const ro = new ResizeObserver(() => {
        map.invalidateSize();
      });
      ro.observe(mapRef.current);
      resizeObsRef.current = ro;

      const handleWinResize = () => map.invalidateSize();
      window.addEventListener("resize", handleWinResize);

      // Optional: invalidate once after initial paint
      requestAnimationFrame(() => map.invalidateSize());

      return () => {
        window.removeEventListener("resize", handleWinResize);
      };
    }

    return () => {
      if (resizeObsRef.current && mapRef.current) {
        try {
          resizeObsRef.current.unobserve(mapRef.current);
          resizeObsRef.current.disconnect();
        } catch {}
        resizeObsRef.current = null;
      }
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
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
