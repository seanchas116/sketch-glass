import User from "../model/User";
import firebaseRoot from "../firebaseRoot";
import RxFirebaseQuery from "../lib/firebase/RxFirebaseQuery";
import TreeDisposable from "../lib/TreeDisposable";
import * as APIRequest from "../APIRequest";
import {md5} from "../util";

interface UserData {
  name: string;
  email_md5: string;
}

// UserFetcher is responsible for fetching and auto-updating User data
export default
class UserFetcher extends TreeDisposable {
  static ref(id: string) {
    return firebaseRoot.child(`users/${id}`);
  }

  set data(data: UserData) {
    this.user.name.value = data.name;
    this.user.emailMD5.value = data.email_md5;
  }

  get data() {
    return {
      name: this.user.name.value || "",
      email_md5: this.user.emailMD5.value || ""
    };
  }

  constructor(public user: User) {
    super();
    user.disposables.add(this);
    const onValue = new RxFirebaseQuery(UserFetcher.ref(user.id)).on("value");
    this.disposables.add(
      onValue.subscribe(snap => this.data = snap.val()),
      user.saveRequested.subscribe(() => this.update())
    );
  }

  update() {
    // TODO
  }

  static async fetch(id: string) {
    const data = (await UserFetcher.ref(id).once("value")).val();
    if (data != null) {
      const user = new User(id);
      const userFetcher = new UserFetcher(user);
      userFetcher.data = data;
      return user;
    }
  }

  static async fetchCurrent() {
    const json = await APIRequest.request("/users/current");
    const user = new User(json["id"]);
    const userFetcher = new UserFetcher(user);
    userFetcher.data = {
      name: json["name"],
      email_md5: md5(json["email"])
    };
    return user;
  }
}
