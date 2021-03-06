import Component from "../lib/ui/Component";
import MountPoint from "../lib/ui/MountPoint";
import Variable from "../lib/rx/Variable";
import * as Rx from "rx";

export default
    class ClickToEditView extends Component {

    static template = `
    <div class="sg-click-to-edit">
      <input class="edit">
      <p class="text"></p>
    </div>
  `;

    isEditing = new Variable(false);
    isEditingEnabled = new Variable(true);
    text = new Variable("");
    editSlot = this.slotFor<HTMLInputElement>(".edit");
    textSlot = this.slotFor(".text");
    textEdited = new Rx.Subject<string>();

    constructor(mountPoint: MountPoint) {
        super(mountPoint);
        this.subscribe(this.isEditing.changed, this.slot.toggleClass("editing"));
        this.subscribe(this.text.changed, this.editSlot.attribute("value"));
        this.subscribe(this.text.changed, this.textSlot.text);
        this.subscribe(this.textSlot.clicked, () => this.startEditing());
        this.subscribe(this.editSlot.enterPressed, () => this.endEditing());
        this.subscribe(this.editSlot.escPressed, () => this.cancelEditing());
        this.subscribe(this.isEditingEnabled.changed.filter(x => !x), () => this.endEditing());
        this.subscribe(this.editSlot.blurred, () => this.endEditing());
    }

    startEditing() {
        if (!this.isEditingEnabled.value) {
            return;
        }
        this.isEditing.value = true;
        const edit = this.editSlot.element;
        edit.setSelectionRange(0, edit.value.length);
    }

    endEditing() {
        if (this.isEditing.value) {
            const edit = this.editSlot.element;
            edit.blur();
            this.textEdited.onNext(edit.value);
            this.isEditing.value = false;
        }
    }

    cancelEditing() {
        this.editSlot.element.value = this.text.value;
        this.isEditing.value = false;
    }
}
