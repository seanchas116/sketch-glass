import Component from "../lib/ui/Component";
import Variable from "../lib/rx/Variable";
import * as Rx from "rx";

export default
class ButtonView extends Component {
  static template = `
    <button class="sg-button"></button>
  `;

  isChecked = new Variable(false);
  clicked = Rx.Observable.fromEvent(this.element, 'click');

  constructor(mountPoint: Element, kind: string) {
    super(mountPoint);
    this.isChecked.observable.subscribe(this.slot.toggleClass("checked"));
    this.element.className += ` ${kind}`;
  }
}
