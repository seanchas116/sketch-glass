import Component from "../../lib/ui/Component";
import Variable from "../../lib/rx/Variable";
import ButtonView from "../ButtonView";
import DisposableBag from "../../lib/DisposableBag";
import {appViewModel} from "../../viewmodel/AppViewModel";
import Slot from "../../lib/ui/Slot";

export default
class UserSideBarView extends Component {
  static template = `
    <div class="sg-sidebar">
      <div class="sg-sidebar-clip">
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
          <div class="canvas-list">
            <div class="sg-canvas-cell selected">
              <div class="thumbnail"></div>
              <div class="info">
                <p class="title">Design sketch</p>
                <p class="updated-at">2 days ago</p>
              </div>
            </div>
          </div>
        </aside>
      </div>
      <div class="sidebar-button"></div>
    </div>
  `;

  open = new Variable(false);
  sidebarButton = new ButtonView(this.elementFor(".sidebar-button"), "sidebar");
  avatarSlot = this.slotFor(".avatar")
  userNameSlot = this.slotFor(".userName");

  constructor(mountPoint: Element) {
    super(mountPoint);

    this.open.changed.subscribe(this.slot.toggleClass("open"));
    this.open.changed.subscribe(this.sidebarButton.isChecked);
    this.sidebarButton.clicked.subscribe(() => {
      this.open.value = !this.open.value;
    });

    this.disposables.add(
      appViewModel.user.changed.subscribe(user => {
        if (user != null) {
          this.userNameSlot.text()(user.displayName),
          this.avatarSlot.attribute("src")(user.photoLink)
        }
      })
    );
  }
}
