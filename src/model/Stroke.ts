import Vec2 from '../lib/geometry/Vec2';
import Curve from '../lib/geometry/Curve';
import Color from '../lib/geometry/Color';
import Rect from '../lib/geometry/Rect';
import * as _ from 'lodash';
import * as Rx from "rx";

export default
class Stroke {
  points: Vec2[] = [];
  color = new Color(0,0,0,1);
  width = 1;
  type = "pen";
  pointAdded = new Rx.Subject<Vec2>();

  constructor() {
  }

  addPoint(point: Vec2) {
    this.points.push(point);
    this.pointAdded.onNext(point);
  }
}
