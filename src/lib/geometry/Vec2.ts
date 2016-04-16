import Transform from "./Transform";
import {FLOAT_EPSILON} from "./util";

export default
class Vec2 {

  constructor(public x: number, public y: number) {
  }

  add(a: Vec2) {
    return new Vec2(this.x + a.x, this.y + a.y);
  }

  sub(a: Vec2) {
    return new Vec2(this.x - a.x, this.y - a.y);
  }

  mul(a: number) {
    return new Vec2(this.x * a, this.y * a);
  }

  div(a: number) {
    return new Vec2(this.x / a, this.y / a);
  }

  negate() {
    return new Vec2(-this.x, -this.y);
  }

  rotate90() {
    return new Vec2(-this.y, this.x);
  }

  rotate270() {
    return new Vec2(this.y, -this.x);
  }

  normalize() {
    return this.div(this.length);
  }

  midpoint(a: Vec2) {
    return this.add(a).mul(0.5);
  }

  dot(a: Vec2) {
    return this.x * a.x  + this.y * a.y;
  }

  get length() {
    return Math.sqrt(this.x * this.x + this.y * this.y);
  }

  lengthSquare() {
    return this.length * this.length;
  }

  floor() {
    return new Vec2(Math.floor(this.x), Math.floor(this.y));
  }

  ceil() {
    return new Vec2(Math.ceil(this.x), Math.ceil(this.y));
  }

  transform(t: Transform) {
    const x = t.m11 * this.x + t.m21 * this.y + t.dx;
    const y = t.m12 * this.x + t.m22 * this.y + t.dy;
    return new Vec2(x, y);
  }

  toString() {
    return `Vec2(${this.x},${this.y})`;
  }

  equals(other: Vec2) {
    return this.x === other.x && this.y === other.y;
  }

  fuzzyEquals(other: Vec2) {
    return Math.abs(this.x - other.x) < FLOAT_EPSILON
      && Math.abs(this.y - other.y) < FLOAT_EPSILON;
  }
}
