import Component from "../lib/ui/Component";
import firebaseRoot from "../firebase/root";
import UserFirebase from "../firebase/UserFirebase";
import {app} from "../model/App";
import * as Rx from "rx";

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
        const authData = await firebaseRoot.authWithCustomToken(authToken);
        const user = await UserFirebase.fromGoogleAuth(authData);
        app.user.value = user;
      } catch (e) {
        console.error("reauth error!");
        console.error(e);
        this.isShown.value = true;
      }
    }
  }

  async auth() {
    const authData = await firebaseRoot.authWithOAuthPopup("google", {scope: "email"});
    localStorage["auth.token"] = authData.token;
    localStorage["auth.expires"] = authData.expires;
    const user = await UserFirebase.fromGoogleAuth(authData);
    app.user.value = user;
  }
}
