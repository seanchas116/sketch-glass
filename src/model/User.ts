import * as GoogleAPI from "../lib/GoogleAPI";

export default
class User {
  constructor(public displayName: string, public photoLink: string, public emailAddress: string) {
  }

  static empty() {
    return new User("", "", "");
  }

  static async current() {
    const {user} = await GoogleAPI.get<any>("https://www.googleapis.com/drive/v3/about", {fields: "user" });
    return new User(user.displayName, user.photoLink, user.emailAddress);
  }
}
