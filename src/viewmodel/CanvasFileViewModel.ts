import Transform from '../lib/geometry/Transform';
import Variable from "../lib/rx/Variable";
import CanvasFile from "../model/CanvasFile";
import User from "../model/User";
import * as Auth from "../Auth";

declare module gapi.drive.share {
  export var ShareClient: any;
}

export default
class CanvasFileViewModel {
  id: string;
  name = new Variable("");
  modifiedTime = new Variable(new Date());

  constructor(file: CanvasFile) {
    this.id = file.id;
    this.update(file);
  }

  update(file: CanvasFile) {
    if (this.id != file.id) {
      throw new Error("wrong file ID");
    }
    this.name.value = file.name;
    this.modifiedTime.value = file.modifiedTime;
  }

  get file() {
    return new CanvasFile({
      id: this.id,
      name: this.name.value,
      modifiedTime: this.modifiedTime.value
    });
  }

  async rename(name: string) {
    if (this.name.value != name) {
      this.name.value = name;
      await CanvasFile.rename(this.id, name);
    }
  }

  dispose() {
  }

  async openShareDialog() {
    const shareClient = new gapi.drive.share.ShareClient();
    shareClient.setOAuthToken(Auth.accessToken);
    shareClient.setItemIds([this.id]);
    shareClient.showSettingsDialog();
  }
}
