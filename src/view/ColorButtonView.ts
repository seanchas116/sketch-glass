import Color from "../lib/geometry/Color";
import Component from "../lib/ui/Component";
import MountPoint from "../lib/ui/MountPoint";
import Variable from "../lib/rx/Variable";
import ButtonView from "./ButtonView";
import * as Rx from "rx";

export default
class ColorButtonView extends Component {
  static template = `
    <button class="sg-button sg-color-button">
      <div class="color"></div>
    </button>
  `;

  isChecked = new Variable(false);
  isDisabled = new Variable(false);
  color = new Variable(Color.fromHSV(200, 0.9, 0.9));
  clicked = Rx.Observable.fromEvent(this.element, 'click');
  colorElem = this.elementFor(".color") as HTMLElement;

  constructor(mountPoint: MountPoint) {
    super(mountPoint);
    this.subscribe(this.isChecked.changed, this.slot.toggleClass("checked"));
    this.subscribe(this.isDisabled.changed, this.slot.toggleAttribute("disabled"));
    this.subscribe(this.color.changed, color => {
      this.colorElem.style.backgroundColor = color.toString();
    });
  }
}
