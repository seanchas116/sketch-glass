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
    this.authWithLastToken();
  }

  async authWithLastToken() {
    const authToken = localStorage["auth.token"];
    const authExpires = localStorage["auth.expires"];
    console.log(`token: ${authToken}`);
    console.log(`expires: ${authExpires}`);

    if (authToken && authExpires - Date.now() / 1000 > 12 * 60 * 60) {
      this.isShown.value = false;
      try {
        let [_, user] = await Promise.all([await Auth.authFirebase(), await UserFetcher.fetchCurrent()]);
        app.user.value = user;
      } catch (e) {
        console.error("reauth error!");
        console.error(e);
        this.isShown.value = true;
      }
    }
  }

  auth() {
    Auth.loginWithGoogle();
  }
}
