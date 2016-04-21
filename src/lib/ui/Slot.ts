import * as Rx from "rx";
import {toggleClass} from "./util";

export default
class Slot {
  constructor(public element: Element) {
  }

  addClass() {
    let oldClass = "";
    return (newClass: string) => {
      const classes = new Set(this.element.className.split(" "));
      classes.delete(oldClass);
      classes.add(newClass);
      oldClass = newClass;
      this.element.className = Array.from(classes).join(" ");
    };
  }

  toggleClass(klass: string) {
    return (value: boolean) => {
      toggleClass(this.element, klass, value);
    };
  }

  text() {
    return (text: string) => {
      this.element.textContent = text;
    }
  }

  attribute(name: string) {
    return (value: string) => {
      this.element.setAttribute(name, value);
    };
  }
}
