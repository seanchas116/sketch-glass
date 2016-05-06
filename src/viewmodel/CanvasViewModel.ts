import Transform from '../lib/geometry/Transform';
import Variable from "../lib/rx/Variable";
import Canvas from "../model/Canvas";

export default
class CanvasViewModel {
  transform = new Variable(Transform.identity());

  constructor(public canvas: Canvas) {
  }
}
