import React, { Component } from "react";
import _ from "lodash";
import { Responsive, WidthProvider } from "react-grid-layout";
import DockableItem from "./dockable-item";
import ProjectTree from "../project-tree";
import ComponentEditorComponent from "../component-editor-component";
import MapComponent from "../map-component";
import MessageComponent from "../message-component";

const ResponsiveReactGridLayout = WidthProvider(Responsive);
const COMPONENT = "component";

class DockableFrame extends Component {
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
