import Variable from "../lib/rx/Variable";
import DisposableBag from "../lib/DisposableBag";
import CanvasViewModel from "./CanvasViewModel";

export default
class AppViewModel extends DisposableBag {
  canvasViewModel = new CanvasViewModel();

  constructor() {
    super();
    this.addDisposable(this.canvasViewModel);
  }

  static instance = new AppViewModel();
}
