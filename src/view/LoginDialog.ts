import Component from "../lib/ui/Component";

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

  constructor(mountPoint: Element) {
    super(mountPoint);
  }
}
