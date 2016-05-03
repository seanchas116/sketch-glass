import Transform from '../lib/geometry/Transform';
import Variable from "../lib/rx/Variable";
import Color from "../lib/geometry/Color";
import Canvas from "../model/Canvas";
import Tool from "../model/Tool";

export default
class CanvasViewModel {
  transform = new Variable(Transform.identity());
  tool = new Variable(Tool.Pen);
  penWidth = new Variable(3);
  eraserWidth = new Variable(30);
  color = new Variable(Color.black);

  constructor(public canvas: Canvas) {
  }
}
