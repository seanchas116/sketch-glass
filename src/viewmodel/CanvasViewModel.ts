import Transform from '../lib/geometry/Transform';
import Variable from "../lib/rx/Variable";
import Canvas from "../model/Canvas";
import User from "../model/User";
import * as Auth from "../Auth";

declare module gapi.drive.share {
  export var ShareClient: any;
}

export default
class CanvasViewModel {
  transform = new Variable(Transform.identity());
  users = new Variable<User[]>([]);

  constructor(public canvas: Canvas) {
    this.fetchUsers();
  }

  async openShareDialog() {
    const shareClient = new gapi.drive.share.ShareClient();
    shareClient.setOAuthToken(Auth.accessToken);
    shareClient.setItemIds([this.canvas.file.id]);
    shareClient.showSettingsDialog();
  }

  async fetchUsers() {
    this.users.value = await this.canvas.file.fetchUsers();
  }
}
