import User from "../model/User";
import firebaseRoot from "../firebaseRoot";
import RxFirebaseQuery from "../lib/firebase/RxFirebaseQuery";
import TreeDisposable from "../lib/TreeDisposable";
import config from "../config";

interface UserData {
  name: string;
  email: string;
}

// UserFetcher is responsible for fetching and auto-updating User data
export default
class UserFetcher extends TreeDisposable {
  static ref(id: string) {
    return firebaseRoot.child(`users/${id}`);
  }

  set data(data: UserData) {
    this.user.name.value = data.name;
    this.user.email.value = data.email;
  }

  get data() {
    return {
      name: this.user.name.value || "",
      email: this.user.email.value || ""
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
    const response = await fetch(`${config.api.root}/users/current`);
    if (response.status == 200) {
      const json = await response.json();
      const user = new User(json["id"]);
      const userFetcher = new UserFetcher(user);
      userFetcher.data = {
        name: json["name"],
        email: json["email"]
      };
      return user;
    } else {
      throw new Error("cannot fetch current user");
    }
  }
}
