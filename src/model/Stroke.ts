import Point from '../common/Point';
import Curve from '../common/Curve';
import Color from '../common/Color';
import Rect from '../common/Rect';
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
