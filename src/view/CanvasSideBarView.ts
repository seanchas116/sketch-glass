import Component from "../lib/ui/Component";
import Variable from "../lib/rx/Variable";
import ButtonView from "./ButtonView";
import DisposableBag from "../lib/DisposableBag";
import Slot from "../lib/ui/Slot";
import ListView from "../lib/ui/ListView";
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
        </div>
      </aside>
      <div class="sg-icon-array">
        <div class="sidebar-button"></div>
      </div>
    </div>
  `;

  open = new Variable(false);
  sidebarButton = new ButtonView(this.elementFor(".sidebar-button"), "info");

  constructor(mountPoint: Element) {
    super(mountPoint);

    this.disposables.add(
      this.open.observable.subscribe(this.slot.toggleClass("open")),
      this.open.observable.subscribe(this.sidebarButton.isChecked),
      this.sidebarButton.clicked.subscribe(() => {
        this.open.value = !this.open.value;
      })
    );
  }
}
