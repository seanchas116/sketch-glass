import Component from "../lib/ui/Component";
import MountPoint from "../lib/ui/MountPoint";
import * as Rx from "rx";

export default
class NewCanvasDialog extends Component {
  static template = `
    <div class='sg-new-canvas-dialog'>
      <section class='dialog'>
        <h1>Create New Canvas</h1>
        <div class="inputs">
          <input class='name' placeholder='Name...'>
          <button class='ok'>Create</button>
        </div>
      </section>
    </div>
  `;

  clicked = Rx.Observable.fromEvent(this.elementFor(".ok"), 'click');
  onFinish: ((name: string) => void)|undefined;

  constructor(mountPoint: MountPoint) {
    super(mountPoint);
    this.subscribe(this.clicked, () => {
      const {onFinish} = this;
      if (onFinish) {
        onFinish((this.elementFor(".name") as HTMLInputElement).value);
      }
      this.dispose();
    });
  }

  static open() {
    return new Promise<string>(resolve => {
      const dialog = NewCanvasDialog.newInRoot() as NewCanvasDialog;
      dialog.onFinish = resolve;
    });
  }
}
