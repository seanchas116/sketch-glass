import Component from "../lib/ui/Component";
import MountPoint from "../lib/ui/MountPoint";
import Variable from "../lib/rx/Variable";
import Slot from "../lib/ui/Slot";
import CanvasFile from "../model/CanvasFile";
import * as moment from "moment";
import ClickToEditView from "./ClickToEditView";
import CanvasFileViewModel from "../viewmodel/CanvasFileViewModel";

export default
class CanvasFileCell extends Component {
  static template = `
    <div class="sg-canvas-cell">
      <div class="thumbnail"></div>
      <div class="info">
        <div class="title"></div>
        <p class="updated-at">2 days ago</p>
      </div>
    </div>
  `;

  isSelected = new Variable(false);
  thumbnailSlot = this.slotFor(".thumbnail");
  updatedAtSlot = this.slotFor(".updated-at");
  titleEdit = new ClickToEditView(this.mountPointFor(".title"));

  constructor(mountPoint: MountPoint, public fileVM: CanvasFileViewModel) {
    super(mountPoint);
    this.subscribe(this.isSelected.changed, this.slot.toggleClass("selected"));
    this.subscribe(this.isSelected.changed, this.titleEdit.isEditingEnabled);
    this.subscribe(fileVM.file.changed.map(f => f.name), this.titleEdit.text);
    this.subscribe(fileVM.file.changed.map(f => moment(f.modifiedTime).fromNow()), this.updatedAtSlot.text());
    this.subscribe(this.titleEdit.textEdited, name => this.updateName(name));
  }

  async updateName(name: string) {
    this.titleEdit.text.value = name;
    await this.fileVM.file.value.rename(name);
  }
}
