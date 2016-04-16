import Component from "../lib/ui/Component";
import CanvasView from "./CanvasView";
import SideBarView from "./SideBarView";
import ButtonView from "./ButtonView";
import ToolBoxView from "./ToolBoxView";
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
  canvasView = new CanvasView(this.elementFor(".canvas-view"), this.canvas);
  sideBarView = new SideBarView(this.elementFor(".sidebar-view"));
  toolBoxView = new ToolBoxView(this.elementFor(".palette-view"), this.canvas.toolBox);
  infoButtonsView = new InfoButtonsView(this.elementFor(".info-buttons-view"));

  constructor(mountPoint: Element) {
    super(mountPoint);
  }
}
