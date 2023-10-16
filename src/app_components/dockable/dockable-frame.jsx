import React from "react";
import _ from "lodash";
import RGL, { WidthProvider } from "react-grid-layout";
import DockableItem from "./dockable-item";
import ProjectTree from "../project-tree";
import ComponentEditorComponent from "../component-editor-component";
import MapComponent from "../map-component";
import MessageComponent from "../message-component";

const ReactGridLayout = WidthProvider(RGL);

export default class DockableFrame extends React.PureComponent {
  static defaultProps = {
    className: "layout",
    rowHeight: 30,
    onLayoutChange: function () {},
    cols: 12,
  };

  constructor(props) {
    super(props);

    // Initialize the items state with the MessageComponent
    const items = [
      { id: "projecttree", content: ProjectTree },
      { id: "componenteditor", content: ComponentEditorComponent },
      { id: "map", content: MapComponent },
      { id: "message", content: MessageComponent },
    ];

    const layout = this.generateLayout(items);
    this.state = { layout, items };
  }

  generateItems() {
    return React.Children.map(this.props.children, (child, index) => {
      const { id, content } = child.props;
      return <DockableItem key={index} id={id} content={content} />;
    });
  }

  generateLayout(items) {
    const p = this.props;
    const itemCount = items.length;
    return _.map(new Array(itemCount), function (item, i) {
      const y = _.result(p, "y") || Math.ceil(Math.random() * 4) + 1;
      return {
        x: (i * 2) % 12,
        y: Math.floor(i / 6) * y,
        w: 2,
        h: y,
        i: i.toString(),
      };
    });
  }

  onLayoutChange(layout) {
    this.props.onLayoutChange(layout);
  }

  render() {
    return (
      <ReactGridLayout
        layout={this.state.layout}
        onLayoutChange={this.onLayoutChange}
        {...this.props}
      >
        {this.generateItems()}
        <DockableItem
          key="projecttree"
          id="projecttree"
          content={<ProjectTree />}
        />
        <DockableItem
          key="componenteditor"
          id="componenteditor"
          content={<ComponentEditorComponent />}
        />
        <DockableItem key="map" id="map" content={<MapComponent />} />
        <DockableItem
          key="message"
          id="message"
          content={<MessageComponent />}
        />
      </ReactGridLayout>
    );
  }
}
