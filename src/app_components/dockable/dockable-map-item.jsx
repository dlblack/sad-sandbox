import React from "react";
import DockableItem from "./dockable-item";
import MapComponent from "../map-component";

function DockableMapItem() {
  return <DockableItem id="map" content={<MapComponent />} />;
}

export default DockableMapItem;
