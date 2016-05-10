import Transform from '../lib/geometry/Transform';
import Variable from "../lib/rx/Variable";
import Canvas from "../model/Canvas";
import User from "../model/User";
import CanvasFileViewModel from "./CanvasFileViewModel";
import * as Auth from "../Auth";

declare module gapi.drive.share {
  export var ShareClient: any;
}

export default
class CanvasViewModel {
  transform = new Variable(Transform.identity());

  constructor(public canvas: Canvas, public fileVM: CanvasFileViewModel) {
  }
}
