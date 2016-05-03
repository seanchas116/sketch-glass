import Variable from "../lib/rx/Variable";
import User from "../model/User";
import Canvas from "../model/Canvas";
import * as Auth from "../Auth";
import UserSideBarViewModel from "./UserSideBarViewModel";

export default
class AppViewModel {
  canvas = new Variable<Canvas | undefined>(undefined);
  userSideBar = new UserSideBarViewModel();

  constructor() {
    Auth.isAuthenticated.changed.filter(a => a).forEach(async () => {
      this.userSideBar.init();
    });
  }
}

export const appViewModel = new AppViewModel();
