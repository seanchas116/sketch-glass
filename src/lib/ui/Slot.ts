import * as Rx from "rx";
import {toggleClass} from "./util";

export default
class Slot<T extends Element> {
    constructor(public element: T) {
    }

    get class() {
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

    get text() {
        return (text: string) => {
            this.element.textContent = text;
        }
    }

    attribute(name: string) {
        return (value: string|undefined) => {
            if (value != undefined) {
                this.element.setAttribute(name, value);
            } else {
                this.element.removeAttribute(name);
            }
        };
    }

    property(name: string) {
        return (value: any) => {
            this.element[name] = value;
        };
    }

    toggleAttribute(name: string) {
        return (value: boolean) => {
            if (value) {
                this.element.setAttribute(name, "");
            } else {
                this.element.removeAttribute(name);
            }
        }
    }

    onEvent<T>(name: string) {
        return Rx.Observable.fromEvent<T>(this.element, name);
    }

    get clicked() {
        return this.onEvent<MouseEvent>("click");
    }
    get changed() {
        return this.onEvent("change");
    }
    get focused() {
        return this.onEvent("focus");
    }
    get blurred() {
        return this.onEvent("blur");
    }
    get enterPressed() {
        return this.onEvent<KeyboardEvent>("keypress").filter(e => e.keyCode == 13);
    }
    get escPressed() {
        return this.onEvent<KeyboardEvent>("keydown").filter(e => e.keyCode == 27);
    }

    get isHidden() {
        return (hidden: boolean) => {
            if (hidden) {
                this.element.setAttribute("hidden", "");
            } else {
                this.element.removeAttribute("hidden");
            }
        };
    }
}
