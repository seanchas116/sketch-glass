import Component from "../../lib/ui/Component";
import Variable from "../../lib/rx/Variable";
import Slot from "../../lib/ui/Slot";
import CanvasFile from "../../model/CanvasFile";
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

  constructor(mountPoint: Element, public canvasFile: CanvasFile) {
    super(mountPoint);
    this.isSelected.changed.subscribe(this.slot.toggleClass("selected"));
    this.titleSlot.text()(canvasFile.name);
    this.updatedAtSlot.text()(moment(canvasFile.modifiedTime).fromNow());
  }
}
