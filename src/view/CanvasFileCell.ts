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
      <img class="thumbnail">
      <div class="info">
        <h2 class="title"></h2>
        <p class="updated-at">2 days ago</p>
      </div>
    </div>
  `;

  isSelected = new Variable(false);
  thumbnailSlot = this.slotFor(".thumbnail");
  updatedAtSlot = this.slotFor(".updated-at");
  titleSlot = this.slotFor(".title");

  constructor(mountPoint: MountPoint, public fileVM: CanvasFileViewModel) {
    super(mountPoint);
    this.subscribe(this.isSelected.changed, this.slot.toggleClass("selected"));
    this.subscribe(fileVM.name.changed, this.titleSlot.text());
    this.subscribe(fileVM.thumbnailLink.changed, this.thumbnailSlot.attribute("src"));
    this.subscribe(fileVM.modifiedTime.changed.map(t => moment(t).fromNow()), this.updatedAtSlot.text());
  }
}
