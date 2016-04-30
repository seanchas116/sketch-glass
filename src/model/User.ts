import * as Rx from "rx";
import Variable from "../lib/rx/Variable";
import TreeDisposable from "../lib/TreeDisposable";
import * as Auth from "../Auth";

export default
class User extends TreeDisposable {
  constructor(public displayName: string, public photoLink: string, public emailAddress: string) {
    super();
  }

  static fetchCurrent() {
    return new Promise<User>((resolve, reject) => {
      const request = gapi.client.request({
        path: "https://www.googleapis.com/drive/v3/about",
        params: {
          fields: "user"
        }
      });
      request.execute(json => {
        const userJson = json.user;
        const user = new User(userJson.displayName, userJson.photoLink, userJson.emailAddress);
        resolve(user);
      });
    });
  }
}
