import * as React from "react";

export default
class SideBarView extends React.Component<void, void> {
  render() {
    return (
      <aside className="sg-sidebar">
        <input placeholder="Search" className="sg-search" />
        <div className="sg-canvas-cell">
          <div className="thumbnail"></div>
          <p className="title">Design sketch</p>
          <p className="updated-at">2 days ago</p>
        </div>
        <button className="sg-button-sidebar checked"></button>
      </aside>
    );
  }
}
