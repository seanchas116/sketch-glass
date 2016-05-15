import Component from "../lib/ui/Component";
import MountPoint from "../lib/ui/MountPoint";
import Variable from "../lib/rx/Variable";
import Slot from "../lib/ui/Slot";
import User from "../model/User";
import * as moment from "moment";

export default
    class UserCell extends Component {
    static template = `
    <div class="sg-user-cell">
      <img class="avatar"></img>
      <p class="name">Foo Bar</p>
    </div>
  `;

    avatarSlot = this.slotFor(".avatar");
    nameSlot = this.slotFor(".name");
    user = new Variable<User>(User.empty());

    constructor(mountPoint: MountPoint) {
        super(mountPoint);
        this.subscribe(this.user.changed.map(u => u.displayName), this.nameSlot.text);
        this.subscribe(this.user.changed.map(u => u.photoLink), this.avatarSlot.attribute("src"));
    }
}
