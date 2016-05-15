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

    nameSlot = this.slotFor<HTMLInputElement>(".name");
    okSlot = this.slotFor(".ok");
    isCancelable = true;
    backgroundClicked = this.slot.clicked;

    constructor(mountPoint: MountPoint) {
        super(mountPoint);
        this.elementFor(".dialog").addEventListener("click", e => e.stopPropagation());
        this.subscribe(this.okSlot.clicked, () => this.ok());
        this.subscribe(this.backgroundClicked, () => this.cancel());
        this.subscribe(this.nameSlot.enterPressed, () => this.ok());
        this.subscribe(this.nameSlot.escPressed, () => this.cancel());
    }

    static show(cancelable: boolean) {
        const dialog = new NewCanvasDialog({});
        dialog.isCancelable = cancelable;
        dialog.showInRoot();
        dialog.nameSlot.element.focus();
    }

    async ok() {
        const name = this.nameSlot.element.value;
        await appViewModel.addFile(name);
        this.dispose();
    }

    cancel() {
        if (this.isCancelable) {
            this.dispose();
        }
    }
}
