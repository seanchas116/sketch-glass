import * as React from "react";
import CanvasView from "./CanvasView";
import SideBarView from "./SideBarView";
import ButtonView from "./ButtonView";
import PaletteView from "./PaletteView";
import InfoButtonsView from "./InfoButtonsView";
import Canvas from "../model/Canvas";

export default
class MainView extends React.Component<void, void> {
  canvas = new Canvas();

  render() {
    return (
      <div>
        <CanvasView canvas={this.canvas} />
        <SideBarView />
        <PaletteView />
        <InfoButtonsView />
      </div>
    );
  }
}
