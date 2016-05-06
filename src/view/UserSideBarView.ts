import Component from "../lib/ui/Component";
import Variable from "../lib/rx/Variable";
import ButtonView from "./ButtonView";
import DisposableBag from "../lib/DisposableBag";
import Slot from "../lib/ui/Slot";
import ListView from "../lib/ui/ListView";
import CanvasFile from "../model/CanvasFile";
import CanvasFileCell from "./CanvasFileCell";
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
        <div class="canvases-header">
          <h2>Canvases</h2>
          <button class="add-canvas">+</button>
        </div>
        <input placeholder="Search" class="sg-search">
        <div class="canvas-list"></div>
      </aside>
      <div class="sg-icon-array">
        <div class="sidebar-button"></div>
      </div>
    </div>
  `;

  open = new Variable(false);
  sidebarButton = new ButtonView(this.elementFor(".sidebar-button"), "sidebar");
  avatarSlot = this.slotFor(".avatar")
  userNameSlot = this.slotFor(".userName");
  canvasListView = new ListView<CanvasFile>(this.elementFor(".canvas-list"), appViewModel.files, file => {
    const component = new CanvasFileCell(undefined, file);
    component.disposables.add(
      appViewModel.currentFile.observable
        .map(current => current == file)
        .subscribe(component.isSelected),
      component.clicked.subscribe(() => {
        appViewModel.currentFile.value = file;
      })
    );
    return component;
  });
  addCanvasClicked = Rx.Observable.fromEvent(this.elementFor(".add-canvas"), 'click');

  constructor(mountPoint: Element) {
    super(mountPoint);

    this.disposables.add(
      this.open.observable.subscribe(this.slot.toggleClass("open")),

      this.open.observable.subscribe(this.sidebarButton.isChecked),

      this.sidebarButton.clicked.subscribe(() => {
        this.open.value = !this.open.value;
      }),

      appViewModel.user.observable.subscribe(user => {
        this.userNameSlot.text()(user.displayName);
        this.avatarSlot.attribute("src")(user.photoLink);
      }),

      this.addCanvasClicked.subscribe(() => {
        appViewModel.addFile();
      })
    );
  }
}
