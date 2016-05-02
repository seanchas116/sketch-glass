import Variable from "../lib/rx/Variable";
import User from "./User";
import Canvas from "./Canvas";
import * as Auth from "../Auth";

export default
class App {
  user = new Variable<User>(null);
  canvas = new Variable<Canvas>(null);

  constructor() {
    Auth.isAuthenticated.changed.filter(a => a).forEach(async () => {
      this.user.value = await User.current();
    });
  }
}

export const app = new App();
