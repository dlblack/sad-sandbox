import React, { Component } from "react";
import _ from "lodash";
import { Responsive, WidthProvider } from "react-grid-layout";
import ProjectTree from "../ProjectTree";
import ComponentEditorComponent from "../ComponentEditorComponent";
import MapComponent from "../MapComponent";
import MessageComponent from "../MessageComponent";
import { generateLayout } from "./Utils";

const ResponsiveReactGridLayout = WidthProvider(Responsive);
const COMPONENT = "component";

class DockableFrame extends Component {
  constructor(props) {
    super(props);
    this.state = {
      currentBreakpoint: "lg",
      compactType: "vertical",
      resizeHandles: ["se"],
      mounted: false,
      layouts: { lg: generateLayout(["se"]) },
    };
  }

  componentsToDisplay = [
    { name: "Project", id: COMPONENT + "1", component: <ProjectTree /> },
    {
      name: "Component Editor",
      id: COMPONENT + "2",
      component: <ComponentEditorComponent />,
    },
    { name: "Map", id: COMPONENT + "3", component: <MapComponent /> },
    { name: "Messages", id: COMPONENT + "4", component: <MessageComponent /> },
  ];

  onCompactTypeChange = () => {
    const { compactType: oldCompactType } = this.state;
    const compactType =
      oldCompactType === "horizontal"
        ? "vertical"
        : oldCompactType === "vertical"
        ? null
        : "horizontal";
    this.setState({ compactType });
  };

  onResizeTypeChange = () => {
    const resizeHandles =
      this.state.resizeHandles === availableHandles ? ["se"] : availableHandles;
    this.setState({
      resizeHandles,
      layouts: { lg: generateLayout(resizeHandles) },
    });
  };

  onLayoutChange = (layout, layouts) => {
    this.props.onLayoutChange(layout, layouts);
  };

  onNewLayout = () => {
    this.setState({
      layouts: { lg: generateLayout(this.state.resizeHandles) },
    });
  };

  onDrop = (layout, item, e) => {
    alert(`Element parameters: ${JSON.stringify(item)}`);
  };

  generateLayoutItems() {
    return this.componentsToDisplay.map((component) => ({
      ...component,
      x: 0,
      y: 0,
      w: 2,
      h: 1,
      static: false,
    }));
  }

  render() {
    const layoutItems = this.generateLayoutItems();

    return (
      <div>
        <ResponsiveReactGridLayout
          className="layout"
          breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
          cols={{ lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 }}
          rowHeight={30}
          onBreakpointChange={this.onBreakpointChange}
          onDrop={this.onDrop}
          measureBeforeMount={false}
          useCSSTransforms={this.state.mounted}
          compactType={this.state.compactType}
          preventCollision={!this.state.compactType}
          layouts={{
            lg: layoutItems,
            md: layoutItems,
            sm: layoutItems,
            xs: layoutItems,
            xxs: layoutItems,
          }}
        >
          {layoutItems.map((layoutItem) => (
            <div key={layoutItem.id}>
              <div className="gray-box">{layoutItem.component}</div>
            </div>
          ))}
        </ResponsiveReactGridLayout>
      </div>
    );
  }
}

export default DockableFrame;
