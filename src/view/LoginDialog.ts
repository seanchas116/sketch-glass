import Component from "../lib/ui/Component";
import * as Rx from "rx";
import * as Auth from "../Auth";

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

  constructor(mountPoint: Element) {
    super(mountPoint);
    this.disposables.add(
      Auth.isAuthenticated.changed.map(a => !a).subscribe(this.isShown),
      this.clicked.subscribe(() => this.auth())
    );
  }

  auth() {
    Auth.popup();
  }
}
