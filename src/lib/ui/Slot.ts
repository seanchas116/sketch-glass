import * as Rx from "rx";

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
      const classes = new Set(this.element.className.split(" "));
      if (value) {
        classes.add(klass);
      } else {
        classes.delete(klass);
      }
      this.element.className = Array.from(classes).join(" ");
    };
  }

  text() {
    return (text: string) => {
      this.element.textContent = text;
    }
  }
}
