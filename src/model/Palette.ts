import Stroke from './Stroke';
import Tool from "./Tool";
import Point from '../lib/geometry/Point';
import Color from '../lib/geometry/Color';
import Transform from '../lib/geometry/Transform';
import Variable from "../lib/rx/Variable";
import DisposableBag from "../lib/DisposableBag";
import * as Rx from "rx";

export default
class Palette extends DisposableBag {
  tool = Tool.Pen;
  width = 3;
  color = new Color(0,0,0,1);
  changed = new Rx.Subject<void>();
}
