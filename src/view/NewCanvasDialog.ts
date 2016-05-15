import Component from "../lib/ui/Component";
import MountPoint from "../lib/ui/MountPoint";
import {appViewModel} from "../viewmodel/AppViewModel";
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

    clicked = this.slotFor(".ok").clicked;
    isCancellable = true;
    backgroundClicked = this.slot.clicked;

    constructor(mountPoint: MountPoint) {
        super(mountPoint);
        this.elementFor(".dialog").addEventListener("click", e => e.stopPropagation());
        this.subscribe(this.clicked, async () => {
            const name = (this.elementFor(".name") as HTMLInputElement).value;
            await appViewModel.addFile(name);
            this.dispose();
        });
        this.subscribe(this.backgroundClicked, () => {
            if (this.isCancellable) {
                this.dispose();
            }
        });
    }
}
