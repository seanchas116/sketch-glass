import Component from "../lib/ui/Component";
import MountPoint from "../lib/ui/MountPoint";
import * as Rx from "rx";
import {appViewModel} from "../viewmodel/AppViewModel";

export default
class LoginDialog extends Component {
  static template = `
    <div class='sg-login-dialog'>
      <section class='dialog'>
        <h1>Sign in</h1>
        <button class='login-google'>Continue with Google</button>
      </section>
    </div>
  `;

  clicked = Rx.Observable.fromEvent(this.elementFor(".login-google"), 'click');

  constructor(mountPoint: MountPoint) {
    super(mountPoint);
    this.subscribe(appViewModel.isLoginNeeded.changed.map(x => !x), this.slot.isHidden());
    this.subscribe(this.clicked, () => this.auth());
  }

  auth() {
    appViewModel.logIn();
  }
}
