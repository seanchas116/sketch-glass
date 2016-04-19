import Component from "../../lib/ui/Component";
import Variable from "../../lib/rx/Variable";
import ButtonView from "../ButtonView";

export default
class UserSideBarView extends Component {
  static template = `
    <div class="sg-sidebar">
      <div class="sg-sidebar-clip">
        <aside class="sg-sidebar-content">
          <div class="user-header">
            <img class="avatar" src="https://gravatar.com/avatar/b215d7166d6db49b398150345dbdbb8f?s=64">
            <h1 class="userName">Foo Bar</h1>
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

  constructor(mountPoint: Element) {
    super(mountPoint);

    this.open.changed.subscribe(this.slot.toggleClass("open"));
    this.open.changed.subscribe(this.sidebarButton.isChecked);
    this.sidebarButton.clicked.subscribe(() => {
      this.open.value = !this.open.value;
    });
  }
}
