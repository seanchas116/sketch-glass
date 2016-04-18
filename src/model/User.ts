import Variable from "../lib/rx/Variable";
import * as Firebase from "firebase";
import firebaseRoot from "../firebaseRoot";

interface UserData {
  name: string;
  email: string;
}

export default
class User {
  name = new Variable("");
  email = new Variable("");

  constructor(public id: string, data: UserData) {
    this.name.value = data.name;
    this.email.value = data.email;
  }

  toData(): UserData {
    return {
      name: this.name.value,
      email: this.name.value
    }
  }

  async save() {
    await firebaseRoot.child(`users/${this.id}`).update(this.toData());
  }

  static async fromID(id: string) {
    const userData = (await firebaseRoot.child(`users/${id}`).once("value")).val();
    if (userData != null) {
      return new User(id, userData as UserData);
    }
  }

  static async fromGoogleAuth(authData: FirebaseAuthData) {
    const id = authData.uid;
    let user = await this.fromID(id)
    if (user != null) {
      return user;
    }
    user = new User(authData.uid, {
      name: authData.google.displayName,
      email: authData.google.email
    });
    await firebaseRoot.child(`users/${id}`).set(user.toData());
    return user;
  }
}
