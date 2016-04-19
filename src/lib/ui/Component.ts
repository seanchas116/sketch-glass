import Slot from "./Slot";
import TreeDisposable from "../TreeDisposable";
import Variable from "../rx/Variable";

export default
class Component extends TreeDisposable {
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

  isShown = new Variable(true);

  constructor(mountPoint: Element | null) {
    super();
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
}
