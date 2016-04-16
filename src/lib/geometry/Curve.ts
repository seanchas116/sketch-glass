import Vec2 from './Vec2';
import Rect from './Rect';
const Bezier = require('bezier-js');
const subdivide = require("bezier-subdivide");

export default
class Curve {
  constructor(public start: Vec2, public control1: Vec2, public control2: Vec2, public end: Vec2) {
  }

  midpoint() {
    const xy = this.bezier().get(0.5);
    return new Vec2(xy.x, xy.y);
  }

  split(t: number) {
    const beziers = this.bezier().split(t);
    return [beziers.left, beziers.right].map(Curve._fromBezier);
  }

  calcBoundingRect() {
    const bbox = this.bezier().bbox();
    return new Rect(new Vec2(bbox.x.min, bbox.y.min), new Vec2(bbox.x.max, bbox.y.max));
  }

  subdivide() {
    const controls = [this.start, this.control1, this.control2, this.end].map(p => [p.x, p.y]);
    return (subdivide(controls) as [number, number][]).map(([x, y]) => new Vec2(x, y))
  }

  private bezier() {
    return new Bezier([this.start, this.control1, this.control2, this.end]);
  }

  toString() {
    return `Curve(${this.start},${this.control1},${this.control2},${this.end})`;
  }

  static catmullRom(prev: Vec2, start: Vec2, end: Vec2, next: Vec2) {
    return new Curve(
      start,
      start.add(end.sub(prev).div(6)),
      end.sub(next.sub(start).div(6)),
      end
    );
  }

  static bSpline(c0: Vec2, c1: Vec2, c2: Vec2, c3: Vec2) {
    return new Curve(
      c0.add(c1.mul(4)).add(c2).div(6),
      c1.mul(2).add(c2).div(3),
      c2.mul(2).add(c1).div(3),
      c3.add(c2.mul(4)).add(c1).div(6)
    );
  }

  static _fromBezier(bezier: any) {
    const points: Vec2[] = bezier.points.map((p: any) => new Vec2(p.x, p.y));
    return new Curve(points[0], points[1], points[2], points[3]);
  }
}
