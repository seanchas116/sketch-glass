import Variable from "../lib/rx/Variable";
import ObservableArray from "../lib/rx/ObservableArray";
import User from "../model/User";
import Canvas from "../model/Canvas";
import CanvasFile from "../model/CanvasFile";
import CanvasViewModel from "./CanvasViewModel";
import * as Auth from "../Auth";

export default
class AppViewModel {
  user = new Variable<User>(User.empty());
  files = new ObservableArray<CanvasFile>();
  currentFile = new Variable<CanvasFile | undefined>(undefined);
  canvasViewModel = new Variable<CanvasViewModel | undefined>(undefined);

  async initData() {
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

  constructor() {
    Auth.isAuthenticated.changed.filter(a => a).forEach(async () => {
      this.initData();
    });
    this.currentFile.changed.subscribe(async (file) => {
      this.canvasViewModel.value = undefined;
      if (file == undefined) { return; }
      const canvas = await Canvas.fromFile(file);
      this.canvasViewModel.value = new CanvasViewModel(canvas);
    });
  }
}

export const appViewModel = new AppViewModel();
