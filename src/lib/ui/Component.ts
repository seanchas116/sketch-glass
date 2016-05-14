import Slot from "./Slot";
import MountPoint from "./MountPoint";
import ObservableDestination from "../rx/ObservableDestination";
import Variable from "../rx/Variable";
import * as Rx from "rx";

export default
    class Component extends ObservableDestination {
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

    clicked = Rx.Observable.fromEvent(this.element, 'click');

    constructor(mountPoint: MountPoint) {
        super();
        if (mountPoint.parent != undefined) {
            mountPoint.parent.disposables.add(this);
        }
        if (mountPoint.element != undefined) {
            this.mount(mountPoint.element);
        }
    }

    dispose() {
        if (!this.isDisposed) {
            this.element.parentElement.removeChild(this.element);
        }
        super.dispose();
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
    mountPointFor(selector: string) {
        return { parent: this, element: this.elementFor(selector) };
    }

    showInRoot() {
        document.body.appendChild(this.element);
    }
}
