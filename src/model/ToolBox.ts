import Tool from "./Tool";
import Color from '../lib/geometry/Color';
import Variable from "../lib/rx/Variable";

export default
class ToolBox {
  tool = new Variable(Tool.Pen);
  penWidth = new Variable(3);
  eraserWidth = new Variable(30);
  color = new Variable(Color.black);
}
