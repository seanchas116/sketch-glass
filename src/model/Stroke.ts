import Point from '../lib/geometry/Point';
import Curve from '../lib/geometry/Curve';
import Color from '../lib/geometry/Color';
import Rect from '../lib/geometry/Rect';
import * as _ from 'lodash';
import * as Rx from "rx";

export default
class Stroke {
  points: Point[] = [];
  color = new Color(0,0,0,1);
  width = 1;
  type = "pen";
  pointAdded = new Rx.Subject<Point>();

  constructor() {
  }

  addPoint(point: Point) {
    this.points.push(point);
    this.pointAdded.onNext(point);
  }
}
