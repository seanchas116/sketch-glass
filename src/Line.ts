"use strict";

import Point from "./Point";

export default
class Line {
  // ax + by = c
  a: number;
  b: number;
  c: number;

  // normal vector directs toward left
  get normal() {
    return new Point(this.a, this.b);
  }
  get direction() {
    return this.normal.rotate270();
  }

  constructor(a: number, b: number, c: number) {
    this.a = a;
    this.b = b;
    this.c = c;
  }

  intersection(other: Line, fallback?: Point) {
    var a1 = this.a;
    var b1 = this.b;
    var c1 = this.c;
    var a2 = other.a;
    var b2 = other.b;
    var c2 = other.c;

    var det = a1 * b2 - b1 * a2;
    if (det === 0) {
      if (fallback === undefined) {
        console.warn(`no intersection point for ${this} and ${other}`);
        return new Point(0, 0);
      }
      return fallback;
    }

    return new Point(
      b2 * c1 - b1 * c2,
      a1 * c2 - a2 * c1
    ).div(det);
  }

  // left: > 0
  // on line: = 0
  // right: < 0
  signedDistance(p: Point) {
    return this.normal.dot(p) - this.c;
  }

  bisector(other: Line, fallback?: Line) {
    var i = this.intersection(other, null);
    if (!i) {
      if (fallback === undefined) {
        console.warn(`no bisector line for ${this} and ${other}`);
        return new Line(1, 0, 0);
      }
      return fallback;
    }
    var n = this.normal.add(other.normal).normalize();
    var d = n.dot(i);
    return new Line(n.x, n.y, d);
  }

  // translate to left
  translate(d: number) {
    return new Line(this.a, this.b, this.c + d);
  }

  toString() {
    return `Line(${this.a}x + ${this.b}y = ${this.c})`;
  }

  static fromPointAndNormal(p: Point, n: Point) {
    return new Line(n.x, n.y, n.dot(p));
  }

  static fromTwoPoints(p1: Point, p2: Point) {
    var n = p2.sub(p1).normalize().rotate90();
    return this.fromPointAndNormal(p1, n);
  }
}
