import React from "react";
import { MapContainer, TileLayer } from "react-leaflet";
import "../css/MapComponent.css";

function MapComponent() {
  return (
    <div className="map-container">
      <MapContainer
        center={[38.5758, -121.4788]}
        zoom={13}
        style={{ height: "100%" }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution="© OpenStreetMap contributors"
        />
        {/* Add additional map layers, markers, etc. here */}
      </MapContainer>
    </div>
  );
}

export default MapComponent;
