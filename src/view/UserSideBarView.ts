import Component from "../lib/ui/Component";
import MountPoint from "../lib/ui/MountPoint";
import Variable from "../lib/rx/Variable";
import ButtonView from "./ButtonView";
import Slot from "../lib/ui/Slot";
import ListView from "../lib/ui/ListView";
import CanvasFile from "../model/CanvasFile";
import CanvasFileCell from "./CanvasFileCell";
import NewCanvasDialog from "./NewCanvasDialog";
import {appViewModel} from "../viewmodel/AppViewModel";
import * as Rx from "rx";

export default
    class UserSideBarView extends Component {
    static template = `
    <div class="sg-user-sidebar">
      <aside class="sg-sidebar-content">
        <div class="user-header">
          <img class="avatar">
          <h1 class="userName"></h1>
        </div>
        <input placeholder="Search" class="sg-search">
        <button class="add-canvas">+</button>
        <div class="canvas-list"></div>
      </aside>
      <div class="sg-icon-array">
        <div class="sidebar-button"></div>
      </div>
    </div>
  `;

    open = new Variable(false);
    sidebarButton = new ButtonView(this.mountPointFor(".sidebar-button"), "sidebar");
    avatarSlot = this.slotFor(".avatar")
    userNameSlot = this.slotFor(".userName");

    canvasListView = new ListView<CanvasFileCell>(this.mountPointFor(".canvas-list"));
    currentCanvasCell = new Variable<CanvasFileCell | undefined>(undefined);
    addCanvasClicked = Rx.Observable.fromEvent(this.elementFor(".add-canvas"), 'click');

    constructor(mountPoint: MountPoint) {
        super(mountPoint);
        this.subscribeArrayWithTracking(appViewModel.fileVMs.changed, this.canvasListView.children, {
            create: fileVM => {
                const component = new CanvasFileCell({ parent: this.canvasListView }, fileVM);
                component.subscribe(appViewModel.currentFileVM.changed.map(current => current == fileVM), component.isSelected);
                component.subscribe(component.isSelected.changed, () => {
                    this.currentCanvasCell.value = component;
                });
                component.subscribe(component.clicked, () => {
                    appViewModel.currentFileVM.value = fileVM;
                });
                return component;
            },
        });

        this.subscribe(this.open.changed, this.slot.toggleClass("open"));
        this.subscribe(this.open.changed, this.sidebarButton.isChecked);

        this.subscribe(this.sidebarButton.clicked, () => {
            this.open.value = !this.open.value;
        });

        this.subscribe(appViewModel.user.changed, user => {
            this.userNameSlot.text()(user.displayName);
            this.avatarSlot.attribute("src")(user.photoLink);
        });

        this.subscribe(this.addCanvasClicked, () => this.addFile());
        this.subscribe(this.open.changed, () => this.refreshFiles());
    }

    addFile() {
        new NewCanvasDialog({}).showInRoot();
    }

    refreshFiles() {
        if (this.open.value) {
            console.log("refresh files");
            appViewModel.fetchFiles();
            setTimeout(() => this.refreshFiles(), 2000);
        }
    }
}
