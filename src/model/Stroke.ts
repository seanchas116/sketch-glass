import Vec2 from '../lib/geometry/Vec2';
import Curve from '../lib/geometry/Curve';
import Color from '../lib/geometry/Color';
import Rect from '../lib/geometry/Rect';
import Brush from "./Brush";
import * as _ from 'lodash';
import * as Rx from "rx";

export default
class Stroke {
  constructor(public points: Vec2[], public color: Color, public brush: Brush) {
  }
}
