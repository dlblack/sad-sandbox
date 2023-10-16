import React from "react";
import DockableItemManager from "./dockable-item-manager";

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

    return (
      <div key={id}>
        <span className="text">{content}</span>
      </div>
    );
  }
}

export default DockableItem;
