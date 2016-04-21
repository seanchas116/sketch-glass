import Stroke from './Stroke';
import Transform from '../lib/geometry/Transform';
import Variable from "../lib/rx/Variable";
import ToolBox from "./ToolBox";
import Pushable from "../lib/rx/Pushable";

export default
class Canvas {
  transform = new Variable(Transform.identity());
  toolBox = new ToolBox();
  strokes = new Pushable<Stroke>([]);
}
