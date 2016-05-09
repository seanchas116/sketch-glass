import * as GoogleAPI from "../lib/GoogleAPI";

interface UserInitData {
  permissionId: string;
  displayName: string;
  photoLink: string;
}

export default
class User {
  permissionId: string;
  displayName: string;
  photoLink: string;

  constructor(initData: UserInitData) {
    this.permissionId = initData.permissionId;
    this.displayName = initData.displayName;
    this.photoLink = initData.photoLink;
  }

  static empty() {
    return new User({
      permissionId: "",
      displayName: "",
      photoLink: "",
    });
  }

  static async current() {
    const {user} = await GoogleAPI.get<any>("https://www.googleapis.com/drive/v3/about", {fields: "user"});
    return new User({
      permissionId: user.permissionId,
      displayName: user.displayName,
      photoLink: user.photoLink,
    });
  }
}
