import Stroke from './Stroke';
import Tool from "./Tool";
import Point from '../lib/geometry/Point';
import Color from '../lib/geometry/Color';
import Transform from '../lib/geometry/Transform';
import Variable from "../lib/rx/Variable";
import DisposableBag from "../lib/DisposableBag";
import * as Rx from "rx";

export default
class ToolBox {
  tool = new Variable(Tool.Pen);
  penWidth = new Variable(3);
  eraserWidth = new Variable(20);
  color = new Variable(new Color(0,0,0,1));
}
