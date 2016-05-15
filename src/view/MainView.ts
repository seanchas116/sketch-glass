import Component from "../lib/ui/Component";
import MountPoint from "../lib/ui/MountPoint";
import CanvasView from "./CanvasView";
import UserSideBarView from "./UserSideBarView";
import ToolBoxView from "./ToolBoxView";
import LoginDialog from "./LoginDialog";
import CanvasSideBarView from "./CanvasSideBarView";
import CanvasViewModel from "../viewmodel/CanvasViewModel";
import NewCanvasDialog from "./NewCanvasDialog";
import {appViewModel} from "../viewmodel/AppViewModel";
import * as Rx from "rx";

export default
    class MainView extends Component {
    static template = `
    <div>
      <div class='canvas-view'></div>
      <div class='palette-view'></div>
      <div class='user-sidebar-view'></div>
      <div class='canvas-sidebar-view'></div>
      <div class="sg-loading-bar"></div>
    </div>
  `;
    loadingBar = this.slotFor(".sg-loading-bar");
    canvasView = new CanvasView(this.mountPointFor(".canvas-view"));
    userSideBarView = new UserSideBarView(this.mountPointFor(".user-sidebar-view"));
    toolBoxView = new ToolBoxView(this.mountPointFor(".palette-view"));
    canvasSideBarView = new CanvasSideBarView(this.mountPointFor(".canvas-sidebar-view"));

    constructor(mountPoint: MountPoint) {
        super(mountPoint);
        const canvasVM = appViewModel.canvasViewModel;
        this.subscribe(canvasVM.changed, this.canvasView.canvasViewModel);
        this.subscribe(appViewModel.isLoading.changed.map(x => !x), this.loadingBar.isHidden);

        this.subscribe(appViewModel.isLoginNeeded.changed.filter(x => x), () => {
            new LoginDialog({}).showInRoot();
        });
        const showNewCanvas = Rx.Observable.combineLatest(
            appViewModel.isNewCanvasNeeded.changed,
            appViewModel.isAuthenticated.changed,
            (noCanvas, authenticated) => noCanvas && authenticated
        );
        this.subscribe(showNewCanvas.filter(x => x), () => {
            NewCanvasDialog.show(false);
        });
    }
}
