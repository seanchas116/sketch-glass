import Slot from "./Slot";
import DisposableBag from "../DisposableBag";
import Variable from "../rx/Variable";

export default
class Component {
  static template = "";
  static templateElement: Element | null;

  static getTemplateElement(): Element {
    if (this.templateElement != null) {
      return this.templateElement;
    }
    const parent = document.createElement("div");
    parent.innerHTML = this.template;
    return this.templateElement = parent.firstElementChild;
  }

  element = (this.constructor as typeof Component).getTemplateElement().cloneNode(true) as Element;
  slot = new Slot(this.element);
  disposables = new DisposableBag();

  isShown = new Variable(true);

  constructor(mountPoint: Element | null) {
    if (mountPoint != null) {
      this.mount(mountPoint);
    }
    this.isShown.changed.map(x => !x).subscribe(this.slot.toggleClass("sg-hidden"));
  }

  mount(mountPoint: Element) {
    mountPoint.parentElement.insertBefore(this.element, mountPoint);
    mountPoint.parentElement.removeChild(mountPoint);
  }

  elementFor(selector: string) {
    return this.element.querySelector(selector);
  }
  slotFor(selector: string) {
    return new Slot(this.elementFor(selector));
  }

  dispose() {
    this.disposables.dispose();
  }
}
