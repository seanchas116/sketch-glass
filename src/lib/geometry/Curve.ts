import Point from './Point';
import Rect from './Rect';
const Bezier = require('bezier-js');
const subdivide = require("bezier-subdivide");

export default
class Curve {
  constructor(public start: Point, public control1: Point, public control2: Point, public end: Point) {
  }

  midpoint() {
    const xy = this.bezier().get(0.5);
    return new Point(xy.x, xy.y);
  }

  split(t: number) {
    const beziers = this.bezier().split(t);
    return [beziers.left, beziers.right].map(Curve._fromBezier);
  }

  calcBoundingRect() {
    const bbox = this.bezier().bbox();
    return new Rect(new Point(bbox.x.min, bbox.y.min), new Point(bbox.x.max, bbox.y.max));
  }

  subdivide() {
    const controls = [this.start, this.control1, this.control2, this.end].map(p => [p.x, p.y]);
    return (subdivide(controls) as [number, number][]).map(([x, y]) => new Point(x, y))
  }

  private bezier() {
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
    const points: Point[] = bezier.points.map((p: any) => new Point(p.x, p.y));
    return new Curve(points[0], points[1], points[2], points[3]);
  }
}
