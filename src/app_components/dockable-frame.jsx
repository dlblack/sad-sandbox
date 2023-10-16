import React, { Component } from "react";
import _ from "lodash";
import RGL, { WidthProvider } from "react-grid-layout";
import DockableItemManager from "./dockable-item-manager";

const ReactGridLayout = WidthProvider(RGL);
const dockableItemManager = new DockableItemManager();

class DockableFrame extends Component {
  constructor(props) {
    super(props);
    this.state = {
      items: [],
      layout: [],
    };
  }

  addItem(content) {
    return dockableItemManager.addItem(content);
  }

  removeItem(id) {
    dockableItemManager.removeItem(id);
  }

  generateLayout() {
    const p = this.props;
    const itemCount = this.state.items.length;
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

  render() {
    return (
      <ReactGridLayout
        layout={this.generateLayout()}
        onLayoutChange={this.onLayoutChange}
        {...this.props}
      >
        {this.state.items.map((content, index) => (
          <DockableItem
            key={index}
            content={content}
            addItem={(content) => this.addItem(content)}
            removeItem={(id) => this.removeItem(id)}
          />
        ))}
      </ReactGridLayout>
    );
  }
}

export default DockableFrame;
