import React, { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "../css/MapComponent.css";

function MapComponent() {
  const mapRef = useRef(null);

  useEffect(() => {
    if (mapRef.current && !mapRef.current._leaflet_id) {
      const map = L.map(mapRef.current).setView([38.5758, -121.4788], 13);

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
        attribution: "© OpenStreetMap contributors",
      }).addTo(map);
    }
  }, []);

  return <div ref={mapRef} className="map-window"></div>;
}

export default MapComponent;
