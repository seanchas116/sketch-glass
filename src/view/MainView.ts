import Component from "../lib/ui/Component";
import CanvasView from "./CanvasView";
import UserSideBarView from "./UserSideBarView";
import ToolBoxView from "./ToolBoxView";
import LoginDialog from "./LoginDialog";
import CanvasSideBarView from "./CanvasSideBarView";
import CanvasViewModel from "../viewmodel/CanvasViewModel";
import {appViewModel} from "../viewmodel/AppViewModel";

export default
class MainView extends Component {
  static template = `
    <div>
      <div class='canvas-view'></div>
      <div class='palette-view'></div>
      <div class='user-sidebar-view'></div>
      <div class='canvas-sidebar-view'></div>
      <div class='login-dialog'></div>
      <div class="sg-loading-bar"></div>
    </div>
  `;
  loadingBar = this.slotFor(".sg-loading-bar");
  canvasView = new CanvasView(this.elementFor(".canvas-view"));
  userSideBarView = new UserSideBarView(this.elementFor(".user-sidebar-view"));
  toolBoxView = new ToolBoxView(this.elementFor(".palette-view"));
  canvasSideBarView = new CanvasSideBarView(this.elementFor(".canvas-sidebar-view"));
  loginDialog = new LoginDialog(this.elementFor(".login-dialog"));

  constructor(mountPoint: Element) {
    super(mountPoint);
    const canvasVM = appViewModel.canvasViewModel;
    this.subscribe(canvasVM.changed, this.canvasView.canvasViewModel);
    this.subscribe(appViewModel.isLoading.changed.map(x => !x), this.loadingBar.isHidden());
  }
}
