import * as Rx from "rx";
import Variable from "../lib/rx/Variable";
import TreeDisposable from "../lib/TreeDisposable";
import * as Auth from "../Auth";
import * as gapiUtil from "../lib/gapi/util";

export default
class User extends TreeDisposable {
  constructor(public displayName: string, public photoLink: string, public emailAddress: string) {
    super();
  }

  static async fetchCurrent() {
    const {user} = await gapiUtil.get<any>("https://www.googleapis.com/drive/v3/about", {fields: "user" });
    return new User(user.displayName, user.photoLink, user.emailAddress);
  }
}
