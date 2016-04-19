import User from "../model/User";
import * as Firebase from "firebase";
import root from "./root";
import RxFirebaseQuery from "../lib/firebase/RxFirebaseQuery";
import TreeDisposable from "../lib/TreeDisposable";

interface UserData {
  name: string;
  email: string;
}

// UserFirebase is responsible for fetching and auto-updating User data
export default
class UserFirebase extends TreeDisposable {
  static ref(id: string) {
    return root.child(`users/${id}`);
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
    const onValue = new RxFirebaseQuery(UserFirebase.ref(user.id)).on("value");
    this.disposables.add(
      onValue.subscribe(snap => this.data = snap.val()),
      user.saveRequested.subscribe(() => this.update())
    );
  }

  async update() {
    await UserFirebase.ref(this.user.id).update(this.data);
  }

  async set() {
    await UserFirebase.ref(this.user.id).set(this.data);
  }

  static async fetch(id: string) {
    const data = (await UserFirebase.ref(id).once("value")).val();
    if (data != null) {
      const user = new User(id);
      const userFirebase = new UserFirebase(user);
      userFirebase.data = data;
      return user;
    }
  }

  static async fromGoogleAuth(authData: FirebaseAuthData) {
    const id = authData.uid;
    let user = await this.fetch(id)
    if (user != null) {
      return user;
    }
    user = new User(authData.uid);
    user.name.value = authData.google.displayName;
    user.email.value = authData.google.email;
    new UserFirebase(user).set();
    return user;
  }
}
