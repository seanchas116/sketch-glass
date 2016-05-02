import Variable from "../lib/rx/Variable";
import User from "../model/User";
import Canvas from "../model/Canvas";
import * as Auth from "../Auth";

export default
class AppViewModel {
  user = new Variable<User>(null);
  canvas = new Variable<Canvas>(null);

  constructor() {
    Auth.isAuthenticated.changed.filter(a => a).forEach(async () => {
      this.user.value = await User.current();
    });
  }
}

export const appViewModel = new AppViewModel();
