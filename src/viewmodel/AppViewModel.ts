import Variable from "../lib/rx/Variable";
import ObservableArray from "../lib/rx/ObservableArray";
import ObservableDestination from "../lib/rx/ObservableDestination";
import User from "../model/User";
import Canvas from "../model/Canvas";
import CanvasFile from "../model/CanvasFile";
import CanvasViewModel from "./CanvasViewModel";
import ToolBoxViewModel from "./ToolBoxViewModel";
import * as Auth from "../Auth";
import * as GoogleAPI from "../lib/GoogleAPI";

export default
class AppViewModel extends ObservableDestination {
  user = new Variable<User>(User.empty());
  files = new ObservableArray<CanvasFile>();
  currentFile = new Variable<CanvasFile | undefined>(undefined);
  canvasViewModel = new Variable<CanvasViewModel | undefined>(undefined);
  toolBoxViewModel = new ToolBoxViewModel();
  isAuthenticated = new Variable(false);
  isLoginNeeded = new Variable(false);
  isLoading = new Variable(false);

  async initData() {
    await Promise.all([
      this.fetchUser(),
      this.fetchFiles()
    ]);
    if (this.files.length > 0) {
      this.currentFile.value = this.files.values[0];
    }
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

  async checkAuth() {
    if (await Auth.check()) {
      this.isAuthenticated.value = true;
    } else {
      this.isLoginNeeded.value = true;
    }
  }

  async logIn() {
    await Auth.popup();
    this.isAuthenticated.value = true;
  }

  async init() {
    this.subscribe(this.isAuthenticated.changed.filter(a => a), () => {
      this.initData();
    });

    this.subscribe(this.currentFile.changed, async (file) => {
      this.canvasViewModel.value = undefined;
      if (file == undefined) { return; }
      const canvas = await Canvas.fromFile(file);
      this.canvasViewModel.value = new CanvasViewModel(canvas);
    });

    await GoogleAPI.init();
    await GoogleAPI.load("auth:client,drive-realtime");
    await this.checkAuth();
  }

  constructor() {
    super();
    this.init();
    this.subscribe(this.canvasViewModel.changed.map(vm => vm == undefined), this.isLoading);
  }
}

export const appViewModel = new AppViewModel();
