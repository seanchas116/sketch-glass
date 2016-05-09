import Component from "../lib/ui/Component";
import MountPoint from "../lib/ui/MountPoint";
import Variable from "../lib/rx/Variable";
import * as Rx from "rx";

export default
class ButtonView extends Component {
  static template = `
    <button class="sg-button"></button>
  `;

  isChecked = new Variable(false);
  isDisabled = new Variable(false);
  clicked = Rx.Observable.fromEvent(this.element, 'click');

  constructor(mountPoint: MountPoint, kind: string) {
    super(mountPoint);
    this.subscribe(this.isChecked.changed, this.slot.toggleClass("checked"));
    this.subscribe(this.isDisabled.changed, this.slot.toggleAttribute("disabled"));
    this.element.className += ` ${kind}`;
  }
}
