import Component from "../lib/ui/Component";
import CanvasView from "./CanvasView";
import UserSideBarView from "./userSideBar/UserSideBarView";
import ButtonView from "./ButtonView";
import ToolBoxView from "./ToolBoxView";
import InfoButtonsView from "./InfoButtonsView";
import LoginDialog from "./LoginDialog";
import Canvas from "../model/Canvas";

export default
class MainView extends Component {
  static template = `
    <div>
      <div class='canvas-view'></div>
      <div class='user-sidebar-view'></div>
      <div class='palette-view'></div>
      <div class='info-buttons-view'></div>
      <div class='login-dialog'></div>
    </div>
  `;
  canvas = new Canvas();
  canvasView = new CanvasView(this.elementFor(".canvas-view"), this.canvas);
  UserSideBarView = new UserSideBarView(this.elementFor(".user-sidebar-view"));
  toolBoxView = new ToolBoxView(this.elementFor(".palette-view"), this.canvas.toolBox);
  infoButtonsView = new InfoButtonsView(this.elementFor(".info-buttons-view"));
  loginDialog = new LoginDialog(this.elementFor(".login-dialog"));

  constructor(mountPoint: Element) {
    super(mountPoint);
  }
}
