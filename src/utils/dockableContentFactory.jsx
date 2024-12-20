import React from "react";
import ComponentEditorComponent from "../app_components/ComponentEditorComponent";
import MapComponent from "../app_components/MapComponent";
import MessageComponent from "../app_components/MessageComponent";
import ProjectTree from "../app_components/ProjectTree";
import StyleSelectorComponent from "../app_components/StyleSelectorComponent";

export const dockableContentFactory = (type) => {
  switch (type) {
    case "Project":
      return <ProjectTree />;
    case "ComponentEditor":
      return <ComponentEditorComponent />;
    case "Map":
      return <MapComponent />;
    case "Messages":
      return <MessageComponent />;
    case "StyleSelector":
      return <StyleSelectorComponent />;
    default:
      return <div>Unknown Component</div>;
  }
};
