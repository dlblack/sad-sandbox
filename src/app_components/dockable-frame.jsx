import React from "react";
import _ from "lodash";
import RGL, { WidthProvider } from "react-grid-layout";
import DockableItem from "./dockable-item";

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

    // Initialize the state with an empty array for items
    this.state = {
      layout: [],
      items: [],
    };
  }

  componentDidMount() {
    // Generate and add items for each DockableItem component
    const items = this.generateItems();
    this.setState({ items });
  }

  componentDidUpdate(prevProps, prevState) {
    // Check if items in state have changed
    if (prevState.items !== this.state.items) {
      // Generate layout when items change
      const layout = this.generateLayout();
      this.setState({ layout });
    }
  }

  generateItems() {
    const items = React.Children.map(this.props.children, (child, index) => {
      const { id, content } = child.props;
      return <DockableItem key={index} id={id} content={content} />;
    });

    return items;
  }

  generateLayout() {
    const p = this.props;
    const itemCount = 0;
    if (this.state.items != null) {
      itemCount = this.state.items.length;
    }

    return _.map(new Array(itemCount), function (i) {
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
        {this.state.items}
      </ReactGridLayout>
    );
  }
}
