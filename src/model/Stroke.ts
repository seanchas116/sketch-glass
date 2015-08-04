import Point from '../lib/geometry/Point';
import Curve from '../lib/geometry/Curve';
import Color from '../lib/geometry/Color';
import Rect from '../lib/geometry/Rect';
import _ from 'lodash';
import Rx from "rx";

export default
class Stroke {
  points: Point[] = [];
  color = new Color(0,0,0,1);
  width = 1;
  type = "pen";
  whenPointAdded = new Rx.Subject<Point>();

  constructor() {
  }

  addPoint(point: Point) {
    this.points.push(point);
    this.whenPointAdded.onNext(point);
  }
}
