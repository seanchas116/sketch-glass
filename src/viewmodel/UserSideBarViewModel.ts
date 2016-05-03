import Variable from "../lib/rx/Variable";
import ObservableArray from "../lib/rx/ObservableArray";
import User from "../model/User";
import CanvasFile from "../model/CanvasFile";

export default
class UserSideBarViewModel {
  user = new Variable<User>(User.empty());
  files = new ObservableArray<CanvasFile>();
  currentFile = new Variable<CanvasFile | undefined>(undefined);

  async init() {
    await Promise.all([
      this.fetchUser(),
      this.fetchFiles()
    ]);
  }

  async fetchUser() {
    this.user.value = await User.current();
  }

  async fetchFiles() {
    this.files.values = await CanvasFile.list();
  }

  async addFile() {
    const file = await CanvasFile.create();
    this.files.unshift(file);
  }
}
