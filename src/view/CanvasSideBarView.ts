import Component from "../lib/ui/Component";
import MountPoint from "../lib/ui/MountPoint";
import Variable from "../lib/rx/Variable";
import ButtonView from "./ButtonView";
import Slot from "../lib/ui/Slot";
import ListView from "../lib/ui/ListView";
import User from "../model/User";
import UserCell from "./UserCell";
import {appViewModel} from "../viewmodel/AppViewModel";
import * as Rx from "rx";

export default
class CanvasSideBarView extends Component {
  static template = `
    <div class="sg-canvas-sidebar">
      <aside class="sg-sidebar-content">
        <div class="canvas-header">
          <img class="thumbnail">
          <h1 class="canvas-name">Untitled</h1>
        </div>
        <div class="users-header">
          <h2>Users</h2>
          <button class="add-user">+</button>
        </div>
        <div class="user-list"></div>
      </aside>
      <div class="sg-icon-array">
        <div class="sidebar-button"></div>
      </div>
    </div>
  `;

  open = new Variable(false);
  users = new Variable<User[]>([]);
  sidebarButton = new ButtonView(this.mountPointFor(".sidebar-button"), "info");
  userListView = new ListView<UserCell>(this.mountPointFor(".user-list"));
  canvasNameClicked = Rx.Observable.fromEvent(this.elementFor(".canvas-name"), 'click');
  addUserClicked = Rx.Observable.fromEvent(this.elementFor(".add-user"), 'click');

  constructor(mountPoint: MountPoint) {
    super(mountPoint);
    this.subscribe(this.open.changed, this.slot.toggleClass("open"));
    this.subscribe(this.open.changed, this.sidebarButton.isChecked);
    this.subscribe(this.sidebarButton.clicked, () => {
      this.open.value = !this.open.value;
    });
    this.subscribe(appViewModel.currentFile.changed, async (current) => {
      if (current != undefined) {
        this.users.value = await current.fetchUsers();
      }
    });
    this.subscribeArrayWithTracking(this.users.changed, this.userListView.children, {
      getKey: (user) => user.permissionId,
      create: (user) => {
        const cell = new UserCell({parent: this.userListView});
        cell.user.value = user;
        return cell;
      },
      update: (cell, user) => {
        cell.user.value = user;
      }
    });
    this.subscribe(this.addUserClicked, () => {
      const canvasVM = appViewModel.canvasViewModel.value;
      if (canvasVM) {
        canvasVM.openShareDialog();
      }
    });
    this.subscribe(this.canvasNameClicked, () => {
      const canvasVM = appViewModel.canvasViewModel.value;
      if (canvasVM) {
        window.open(`https://drive.google.com/open?id=${canvasVM.canvas.file.id}`, "_blank");
      }
    });
  }
}
