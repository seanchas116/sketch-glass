import Component from "../lib/ui/Component";
import Variable from "../lib/rx/Variable";
import ButtonView from "./ButtonView";
import Slot from "../lib/ui/Slot";
import ListView from "../lib/ui/ListView";
import ObservableArray from "../lib/rx/ObservableArray";
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
          <h2>People</h2>
        </div>
        <div class="user-list"></div>
      </aside>
      <div class="sg-icon-array">
        <div class="sidebar-button"></div>
      </div>
    </div>
  `;

  open = new Variable(false);
  users = new ObservableArray<User>();
  sidebarButton = new ButtonView(this.elementFor(".sidebar-button"), "info");
  userListView = new ListView<User>(this.elementFor(".user-list"), this.users, user => {
    return new UserCell(undefined, user);
  });

  constructor(mountPoint: Element) {
    super(mountPoint);

    this.subscribe(this.open.changed, this.slot.toggleClass("open"));
    this.subscribe(this.open.changed, this.sidebarButton.isChecked);
    this.subscribe(this.sidebarButton.clicked, () => {
      this.open.value = !this.open.value;
    });
  }
}
