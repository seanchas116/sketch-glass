import Component from "../lib/ui/Component";
import MountPoint from "../lib/ui/MountPoint";
import Variable from "../lib/rx/Variable";
import ButtonView from "./ButtonView";
import Slot from "../lib/ui/Slot";
import ListView from "../lib/ui/ListView";
import ClickToEditView from "./ClickToEditView";
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
          <div class="canvas-name"></div>
          <span class="oi reveal" data-glyph="external-link"></span>
        </div>
         <button class="add-user">+</button>
        <div class="user-list"></div>
      </aside>
      <div class="sg-icon-array">
        <div class="sidebar-button"></div>
      </div>
    </div>
  `;

    open = new Variable(false);
    users = new Variable<User[]>([]);
    nameEdit = new ClickToEditView(this.mountPointFor(".canvas-name"));
    sidebarButton = new ButtonView(this.mountPointFor(".sidebar-button"), "info");
    userListView = new ListView<UserCell>(this.mountPointFor(".user-list"));
    revealClicked = this.slotFor(".reveal").clicked;
    addUserSlot = this.slotFor(".add-user");

    constructor(mountPoint: MountPoint) {
        super(mountPoint);
        this.subscribe(this.open.changed, this.slot.toggleClass("open"));
        this.subscribe(this.open.changed, this.sidebarButton.isChecked);
        this.subscribe(this.sidebarButton.clicked, () => {
            this.open.value = !this.open.value;
            this.refreshUsers();
        });
        this.subscribeWithDestination(appViewModel.canvasViewModel.changed, (canvasVM, dest) => {
            if (canvasVM != undefined) {
                dest.subscribe(canvasVM.users.changed, this.users);
                dest.subscribe(this.addUserSlot.clicked, () => {
                    //      ↓ FIXME: possibly a TypeScript bug
                    canvasVM!.fileVM.openShareDialog();
                });
                dest.subscribe(this.revealClicked, () => {
                    const id = canvasVM!.canvas.file.id;
                    window.open(`https://drive.google.com/drive/blank?action=locate&id=${id}`, "_blank");
                });
                dest.subscribe(canvasVM.fileVM.name.changed, this.nameEdit.text);
                dest.subscribe(this.nameEdit.textEdited, text => canvasVM!.fileVM.rename(text));
                this.nameEdit.isEditingEnabled.value = canvasVM.canvas.canEdit;
                this.addUserSlot.isHidden(!canvasVM.canvas.canEdit);
                this.refreshUsers();
            } else {
                this.users.value = [];
            }
        })
        this.subscribeArrayWithTracking(this.users.changed, this.userListView.children, {
            getKey: (user) => user.permissionId,
            create: (user) => {
                const cell = new UserCell({ parent: this.userListView });
                cell.user.value = user;
                return cell;
            },
            update: (cell, user) => {
                cell.user.value = user;
            }
        });
    }

    refreshUsers() {
        const canvasVM = appViewModel.canvasViewModel.value;
        if (this.open.value && canvasVM) {
            console.log("refresh users");
            canvasVM.fetchUsers();
            setTimeout(() => this.refreshUsers(), 2000);
        }
    }
}
