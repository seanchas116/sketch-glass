import Stroke from './Stroke';
import Brush, {BrushType} from "./Brush";
import Color from '../lib/geometry/Color';
import Transform from '../lib/geometry/Transform';
import Variable from "../lib/rx/Variable";
import DisposableBag from "../lib/DisposableBag";
import * as Rx from "rx";

export default
class ToolBox {
  pen = new Brush(BrushType.Pen, 3, 0);
  eraser = new Brush(BrushType.Eraser, 3, 10);
  brush = new Variable(this.pen);
  color = new Variable(Color.black);
}
