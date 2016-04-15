import Slot from "./Slot";
import DisposableBag from "../DisposableBag";

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

  mount(placeholder: Element) {
    placeholder.parentElement.insertBefore(this.element, placeholder);
    placeholder.parentElement.removeChild(placeholder);
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
