import Component from "../lib/ui/Component";
import Variable from "../lib/rx/Variable";
import ButtonView from "./ButtonView";

interface SideBarState {
  open: boolean;
}

export default
class SideBarView extends Component {
  static template = `
    <div class="sg-sidebar">
      <div class="sg-sidebar-clip">
        <aside class="sg-sidebar-content">
          <input placeholder="Search" class="sg-search">
          <div class="sg-canvas-cell">
            <div class="thumbnail"></div>
            <p class="title">Design sketch</p>
            <p class="updated-at">2 days ago</p>
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
