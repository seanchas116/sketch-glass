import * as React from "react";
import CanvasView from "./CanvasView"
import SideBarView from "./SideBarView"
import Canvas from "../model/Canvas";

export default
class MainView extends React.Component<void, void> {
  canvas = new Canvas();

  render() {
    return (
      <div>
        <CanvasView canvas={this.canvas} />
        <SideBarView />
        <div className="sg-center-icon-array">
          <button className="sg-button-pen"></button>
          <button className="sg-button-eraser"></button>
        </div>
        <div className="sg-right-icon-array">
          <button className="sg-button-info"></button>
          <button className="sg-button-user"></button>
        </div>
      </div>
    );
  }
}
