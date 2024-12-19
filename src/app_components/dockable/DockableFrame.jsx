import React, { Component } from "react";
import DockableItem from "./DockableItem";
import ComponentEditorComponent from "../ComponentEditorComponent";
import MapComponent from "../MapComponent";
import MessageComponent from "../MessageComponent";
import ProjectTree from "../ProjectTree";
import StyleSelectorComponent from "../StyleSelectorComponent";

class DockableFrame extends Component {
  getWindowTitle(type) {
    const titles = {
      StyleSelector: "Style Selector",
      Map: "Map Viewer",
      Project: "Project Explorer",
      ComponentEditor: "Component Editor",
      Messages: "Message Log",
    };
    return titles[type] || type; // Fallback to type if no custom title is set
  }

  startDrag = (id, event) => {
    event.stopPropagation();
    console.log(`[DockableFrame] Start dragging component with ID: ${id}`);
    this.setState({
      dragging: { id, startX: event.clientX, startY: event.clientY },
    });

    window.addEventListener("mousemove", this.handleDrag);
    window.addEventListener("mouseup", this.stopDrag);
  };

  handleDrag = (event) => {
    const { dragging } = this.state;
    if (!dragging) return;

    const { id, startX, startY } = dragging;
    const deltaX = event.clientX - startX;
    const deltaY = event.clientY - startY;

    this.props.setContainers((prev) => {
      const updatedContainers = { ...prev };
      updatedContainers[id].x = Math.max(0, updatedContainers[id].x + deltaX);
      updatedContainers[id].y = Math.max(0, updatedContainers[id].y + deltaY);
      return updatedContainers;
    });

    this.setState({
      dragging: { ...dragging, startX: event.clientX, startY: event.clientY },
    });
  };

  stopDrag = () => {
    console.log(`[DockableFrame] Stopped dragging.`);
    this.setState({ dragging: null });
    window.removeEventListener("mousemove", this.handleDrag);
    window.removeEventListener("mouseup", this.stopDrag);
  };

  renderComponent = (type) => {
    console.log(`[DockableFrame] Rendering component type: ${type}`);
    switch (type) {
      case "StyleSelector":
        return <StyleSelectorComponent />;
      case "Map":
        return <MapComponent />;
      case "Project":
        return <ProjectTree />;
      case "ComponentEditor":
        return <ComponentEditorComponent />;
      case "Messages":
        return <MessageComponent />;
      default:
        return null;
    }
  };

  render() {
    const { containers } = this.props;
    console.log(`[DockableFrame] Rendering containers: ${JSON.stringify(containers)}`);

    return (
      <div className="resizable-frame-container" style={{ position: "relative" }}>
        {Object.entries(containers).map(([id, { x, y, width, height, type }]) => (
          <DockableItem
            key={id}
            id={id}
            x={x}
            y={y}
            width={width}
            height={height}
            type={this.getWindowTitle(type)}
            onRemove={this.props.removeComponent}
            onDragStart={this.startDrag}
          >
            {this.renderComponent(type)}
          </DockableItem>
        ))}
      </div>
    );
  }
}

export default DockableFrame;
