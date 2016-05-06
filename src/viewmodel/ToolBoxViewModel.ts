import Variable from "../lib/rx/Variable";
import Color from "../lib/geometry/Color";
import Tool from "../model/Tool";

export default
class ToolBoxViewModel {
  tool = new Variable(Tool.Pen);
  penWidth = new Variable(3);
  eraserWidth = new Variable(30);
  color = new Variable(Color.black);
}
