import Component from "../lib/ui/Component";
import Variable from "../lib/rx/Variable";
import Slot from "../lib/ui/Slot";
import User from "../model/User";
import * as moment from "moment";

export default
class UserCell extends Component {
  static template = `
    <div class="sg-user-cell">
      <img class="avatar"></div>
      <p class="name">Foo Bar</p>
    </div>
  `;

  avatarSlot = this.slotFor(".avatar");
  nameSlot = this.slotFor(".name");

  constructor(mountPoint: Element | undefined, public user: User) {
    super(mountPoint);
    this.nameSlot.text()(user.displayName);
    this.avatarSlot.attribute("src")(user.photoLink);
  }
}
