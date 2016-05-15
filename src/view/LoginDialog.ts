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

    buttonSlot = this.slotFor(".login-google");

    constructor(mountPoint: MountPoint) {
        super(mountPoint);
        this.subscribe(this.buttonSlot.clicked, () => this.auth());
    }

    async auth() {
        await appViewModel.logIn();
        this.dispose();
    }
}
