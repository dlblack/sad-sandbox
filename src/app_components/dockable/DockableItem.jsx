// Each component in the main window below the toolbar is wrapped with a dockable item.
import React from "react";
import DockableItemManager from "./DockableItemManager";

const dockableItemManager = new DockableItemManager();

class DockableItem extends React.Component {
  constructor(props) {
    super(props);
    this.id = dockableItemManager.addItem(props.content);
  }

  componentWillUnmount() {
    dockableItemManager.removeItem(this.id);
  }

  render() {
    const { id, content } = this.props;

    // Define default width and height
    const defaultWidth = "100px";
    const defaultHeight = "50px";

    return (
      <div key={id}>
        <span
          className="text"
          style={{ width: defaultWidth, height: defaultHeight }}
        >
          {content}
        </span>
      </div>
    );
  }
}

export default DockableItem;
