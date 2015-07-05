import Point from './Point';
import Rect from './Rect';
var Bezier = require('bezier-js');

export default
class Curve {
  start: Point;
  control1: Point;
  control2: Point;
  end: Point;

  constructor(start: Point, control1: Point, control2: Point, end: Point) {
    this.start = start;
    this.control1 = control1;
    this.control2 = control2;
    this.end = end;
  }

  midpoint() {
    var xy = this._bezier().get(0.5);
    return new Point(xy.x, xy.y);
  }

  split(t: number) {
    var beziers = this._bezier().split(t);
    return [beziers.left, beziers.right].map(Curve._fromBezier);
  }

  calcBoundingRect() {
    var bbox = this._bezier().bbox();
    return new Rect(new Point(bbox.x.min, bbox.y.min), new Point(bbox.x.max, bbox.y.max));
  }

  _bezier() {
    return new Bezier([this.start, this.control1, this.control2, this.end]);
  }

  toString() {
    return `Curve(${this.start},${this.control1},${this.control2},${this.end})`;
  }

  static catmullRom(prev: Point, start: Point, end: Point, next: Point) {
    return new Curve(
      start,
      start.add(end.sub(prev).div(6)),
      end.sub(next.sub(start).div(6)),
      end
    );
  }

  static bSpline(c0: Point, c1: Point, c2: Point, c3: Point) {
    return new Curve(
      c0.add(c1.mul(4)).add(c2).div(6),
      c1.mul(2).add(c2).div(3),
      c2.mul(2).add(c1).div(3),
      c3.add(c2.mul(4)).add(c1).div(6)
    );
  }

  static _fromBezier(bezier: any) {
    var points: Point[] = bezier.points.map((p: any) => new Point(p.x, p.y));
    return new Curve(points[0], points[1], points[2], points[3]);
  }
}
