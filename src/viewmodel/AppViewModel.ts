import Variable from "../lib/rx/Variable";
import ObservableDestination from "../lib/rx/ObservableDestination";
import User from "../model/User";
import Canvas from "../model/Canvas";
import CanvasFile from "../model/CanvasFile";
import CanvasFileViewModel from "./CanvasFileViewModel";
import CanvasViewModel from "./CanvasViewModel";
import ToolBoxViewModel from "./ToolBoxViewModel";
import * as Auth from "../Auth";
import * as GoogleAPI from "../lib/GoogleAPI";
import * as Rx from "rx";

export default
    class AppViewModel extends ObservableDestination {
    user = new Variable<User>(User.empty());
    files = new Variable<CanvasFile[]>([]);
    fileVMs = new Variable<CanvasFileViewModel[]>([]);
    fileSearchQuery = new Variable("");
    currentFileVM = new Variable<CanvasFileViewModel | undefined>(undefined);
    canvasViewModel = new Variable<CanvasViewModel | undefined>(undefined);
    toolBoxViewModel = new ToolBoxViewModel();
    isAuthenticated = new Variable(false);
    isLoginNeeded = new Variable(false);
    isNewCanvasNeeded = new Variable(false);
    isLoading = new Variable(false);
    isInitialized = new Variable(false);

    async initData() {
        await Promise.all([
            this.fetchUser(),
            this.fetchFiles()
        ]);
        if (this.fileVMs.value.length > 0) {
            this.currentFileVM.value = this.fileVMs.value[0];
        }
        this.isInitialized.value = true;
    }

    async fetchUser() {
        await this.waitForAuth();
        this.user.value = await User.current();
    }

    async fetchFiles() {
        await this.waitForAuth();
        this.files.value = await CanvasFile.list(this.fileSearchQuery.value);
    }

    async addFile(name: string) {
        await this.waitForAuth();
        const file = await CanvasFile.create(name);
        await this.fetchFiles();
        this.currentFileVM.value = this.fileVMs.value[0];
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
        this.isLoginNeeded.value = false;
    }

    async init() {
        this.subscribe(this.currentFileVM.changed, async (vm) => {
            this.canvasViewModel.value = undefined;
            if (vm == undefined) { return; }
            const canvas = await Canvas.fromFile(vm.file);
            this.canvasViewModel.value = new CanvasViewModel(canvas, vm);
        });

        await GoogleAPI.init();
        await Promise.all([
            GoogleAPI.load("drive-realtime,drive-share"),
            this.checkAuth()
        ]);
        this.initData();
    }

    waitForAuth() {
        return this.isAuthenticated.changed.filter(a => a).first().toPromise();
    }

    constructor() {
        super();
        this.init();
        const loading = Rx.Observable.combineLatest(
            [this.canvasViewModel.changed.map(vm => vm != undefined), this.isLoginNeeded.changed],
            (hasCanvas, loginNeeded) => !hasCanvas && !loginNeeded
        );
        this.subscribe(loading, this.isLoading);
        this.subscribeArrayWithTracking(this.files.changed, this.fileVMs, {
            getKey: file => file.id,
            create: file => {
                return new CanvasFileViewModel(file);
            },
            update: (vm, file) => {
                vm.update(file);
            }
        });
        this.subscribe(
            Rx.Observable.combineLatest(
                this.files.changed.map(files => files.length == 0),
                this.isInitialized.changed,
                (noFile, initialized) => noFile && initialized
            ), this.isNewCanvasNeeded);
    }
}

export const appViewModel = new AppViewModel();
