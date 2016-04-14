import * as React from "react";
import ButtonView from "./ButtonView";
const classNames = require("classnames");

interface SideBarState {
  open: boolean;
}

export default
class SideBarView extends React.Component<void, SideBarState> {
  state = {open: true}

  render() {
    return (
      <div className={classNames("sg-sidebar", {open: this.state.open})}>
        <div className="sg-sidebar-clip">
          <aside className="sg-sidebar-content">
            <input placeholder="Search" className="sg-search" />
            <div className="sg-canvas-cell">
              <div className="thumbnail"></div>
              <p className="title">Design sketch</p>
              <p className="updated-at">2 days ago</p>
            </div>
          </aside>
        </div>
        <ButtonView kind="sidebar" checked={this.state.open} onClick={() => this.toggleOpen()}/>
      </div>
    );
  }

  toggleOpen() {
    this.setState({open: !this.state.open});
  }
}
