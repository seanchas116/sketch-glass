import Component from "./Component";
import MountPoint from "./MountPoint";
import Variable from "../rx/Variable";

export default
class ListView<TChild extends Component> extends Component {
  static template = `
    <div class="sg-list-view">
    </div>
  `;

  children = new Variable<TChild[]>([]);

  constructor(mountPoint: MountPoint) {
    super(mountPoint);
    this.subscribe(this.children.changed, () => this._reorder());
  }

  dispose() {
    if (!this.isDisposed) {
      for (const child of this.children.value) {
        child.dispose();
      }
    }
    super.dispose();
  }

  private _reorder() {
    const {element} = this;
    for (const child of this.children.value) {
      element.appendChild(child.element);
    }
  }
}
