import Transform from "./Transform";
import {FLOAT_EPSILON} from "./util";

export default
class Point {

  constructor(public x: number, public y: number) {
  }

  add(a: Point) {
    return new Point(this.x + a.x, this.y + a.y);
  }

  sub(a: Point) {
    return new Point(this.x - a.x, this.y - a.y);
  }

  mul(a: number) {
    return new Point(this.x * a, this.y * a);
  }

  div(a: number) {
    return new Point(this.x / a, this.y / a);
  }

  negate() {
    return new Point(-this.x, -this.y);
  }

  rotate90() {
    return new Point(-this.y, this.x);
  }

  rotate270() {
    return new Point(this.y, -this.x);
  }

  normalize() {
    return this.div(this.length);
  }

  midpoint(a: Point) {
    return this.add(a).mul(0.5);
  }

  dot(a: Point) {
    return this.x * a.x  + this.y * a.y;
  }

  get length() {
    return Math.sqrt(this.x * this.x + this.y * this.y);
  }

  lengthSquare() {
    return this.length * this.length;
  }

  floor() {
    return new Point(Math.floor(this.x), Math.floor(this.y));
  }

  ceil() {
    return new Point(Math.ceil(this.x), Math.ceil(this.y));
  }

  transform(t: Transform) {
    var x = t.m11 * this.x + t.m21 * this.y + t.dx;
    var y = t.m12 * this.x + t.m22 * this.y + t.dy;
    return new Point(x, y);
  }

  toString() {
    return `Point(${this.x},${this.y})`;
  }

  equals(other: Point) {
    return this.x === other.x && this.y === other.y;
  }

  fuzzyEquals(other: Point) {
    return Math.abs(this.x - other.x) < FLOAT_EPSILON
      && Math.abs(this.y - other.y) < FLOAT_EPSILON;
  }
}
