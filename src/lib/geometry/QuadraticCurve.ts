import Point from "./Point";
import Curve from "./Curve";
import Line from "./Line";
import _ from "lodash";
const Bezier = require("bezier-js");

export default
class QuadraticCurve {
  constructor(public start: Point, public control: Point, public end: Point) {
  }

  midpoint() {
    const xy = this._bezier().get(0.5);
    return new Point(xy.x, xy.y);
  }

  split(t: number) {
    const beziers = this._bezier().split(t);
    return [beziers.left, beziers.right].map(QuadraticCurve._fromBezier);
  }

  _bezier() {
    return new Bezier([this.start, this.control, this.end]);
  }

  toString() {
    return `QuadraticCurve(${this.start},${this.control},${this.end})`;
  }

  static fromCubic(cubicCurve: Curve) {
    const torelance = cubicCurve.end.sub(cubicCurve.start).length / 100;
    const result = cubicToQuadratic(cubicCurve, torelance * torelance);
    return result;
  }

  static _fromBezier(bezier: any) {
    const points: Point[] = bezier.points.map((p: any) => new Point(p.x, p.y));
    return new QuadraticCurve(points[0], points[1], points[2]);
  }
}

function quadraticApproximation(cubicCurve: Curve) {
  const p1 = cubicCurve.start;
  const c1 = cubicCurve.control1;
  const c2 = cubicCurve.control2;
  const p2 = cubicCurve.end;
  const c = c1.add(c2).mul(0.75).sub(p1.add(p2).mul(0.25));
  return new QuadraticCurve(p1, c, p2);
}

function cubicToQuadratic(cubicCurve: Curve, torelanceSquare: number): QuadraticCurve[] {
  const quadraticCurve = quadraticApproximation(cubicCurve);
  const diff = cubicCurve.midpoint().sub(quadraticCurve.midpoint());
  if (diff.lengthSquare() <= torelanceSquare) {
    return [quadraticCurve];
  }

  return cubicCurve.split(0.5)
    .map(c => cubicToQuadratic(c, torelanceSquare))
    .reduce((a, b) => a.concat(b));
}
