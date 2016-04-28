import Component from "../lib/ui/Component";
import UserFetcher from "../fetcher/UserFetcher";
import {app} from "../model/App";
import * as Rx from "rx";
import * as Auth from "../Auth";

export default
class LoginDialog extends Component {
  static template = `
    <div class='sg-login-dialog'>
      <section class='dialog'>
        <h1>Sign In / Sign Up</h1>
        <button class='login-google'>Continue with Google</button>
      </section>
    </div>
  `;

  clicked = Rx.Observable.fromEvent(this.elementFor(".login-google"), 'click');

  constructor(mountPoint: Element) {
    super(mountPoint);
    this.disposables.add(
      app.user.changed.map(u => u == null).subscribe(this.isShown),
      this.clicked.subscribe(() => this.auth())
    );
  }

  auth() {
    Auth.loginWithGoogle();
  }
}