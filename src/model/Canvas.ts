import Stroke from './Stroke';
import Color from '../lib/geometry/Color';
import Transform from '../lib/geometry/Transform';
import Variable from "../lib/rx/Variable";
import ToolBox from "./ToolBox";
import DisposableBag from "../lib/DisposableBag";
import Pushable from "../lib/rx/Pushable";
import * as Rx from "rx";

export default
class Canvas {
  transform = new Variable(Transform.identity());
  toolBox = new ToolBox();
  strokes = new Pushable<Stroke>([]);
}
