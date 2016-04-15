import Component from "../lib/ui/Component";
import CanvasView from "./CanvasView";
import SideBarView from "./SideBarView";
import ButtonView from "./ButtonView";
import PaletteView from "./PaletteView";
import InfoButtonsView from "./InfoButtonsView";
import Canvas from "../model/Canvas";

export default
class MainView extends Component {
  static template = `
    <div>
      <div class='canvas-view'></div>
      <div class='sidebar-view'></div>
      <div class='palette-view'></div>
      <div class='info-buttons-view'></div>
    </div>
  `;
  canvas = new Canvas();
  canvasView = new CanvasView(this.canvas);
  sideBarView = new SideBarView();
  paletteView = new PaletteView();
  infoButtonsView = new InfoButtonsView();

  constructor() {
    super();
    this.canvasView.mount(this.elementFor(".canvas-view"));
    this.sideBarView.mount(this.elementFor(".sidebar-view"));
    this.paletteView.mount(this.elementFor(".palette-view"));
    this.infoButtonsView.mount(this.elementFor(".info-buttons-view"));
  }
}
