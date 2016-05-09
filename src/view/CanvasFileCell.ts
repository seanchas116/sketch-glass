import Component from "../lib/ui/Component";
import Variable from "../lib/rx/Variable";
import Slot from "../lib/ui/Slot";
import CanvasFile from "../model/CanvasFile";
import * as moment from "moment";

export default
class CanvasFileCell extends Component {
  static template = `
    <div class="sg-canvas-cell">
      <div class="thumbnail"></div>
      <div class="info">
        <p class="title">Design sketch</p>
        <p class="updated-at">2 days ago</p>
      </div>
    </div>
  `;

  isSelected = new Variable(false);
  thumbnailSlot = this.slotFor(".thumbnail");
  titleSlot = this.slotFor(".title");
  updatedAtSlot = this.slotFor(".updated-at");
  file = new Variable<CanvasFile>(CanvasFile.empty());

  constructor(mountPoint: Element | undefined) {
    super(mountPoint);
    this.subscribe(this.isSelected.changed, this.slot.toggleClass("selected"));
    this.file.changed.map(f => f.name).subscribe(this.titleSlot.text());
    this.file.changed.map(f => moment(f.modifiedTime).fromNow()).subscribe(this.updatedAtSlot.text());
  }
}
