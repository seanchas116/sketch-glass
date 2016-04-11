import Variable from "../lib/rx/Variable";
import * as Rx from "rx";
import CanvasViewModel from "./CanvasViewModel";

export default
class AppViewModel {
  canvasViewModel = new CanvasViewModel();

  static instance = new AppViewModel();
}
