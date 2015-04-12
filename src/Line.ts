/// <reference path="../typings/bundle.d.ts" />
"use strict";

import Point = require("./Point");

class Line {
  // ax + by = c
  a: number;
  b: number;
  c: number;

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

  crossing(other: Line) {
    var m11 = this.a;
    var m12 = other.a;
    var m21 = this.b;
    var m22 = other.b;
    var det = m11 * m22 - m12 * m21;
    if (det === 0) {
      return null;
    }
    var i11 = m22 / det;
    var i12 = -m12 / det;
    var i21 = -m21 / det;
    var i22 = m11 / det;

    return new Point(
      i11 * this.a + i21 * other.a,
      i12 * this.a + i22 * other.a
    );
  }

  static fromTwoPoints(p1: Point, p2: Point) {
    var normal = p2.sub(p1).normalize().rotate90();
    var c = normal.dot(p1);
    return new Line(normal.x, normal.y, c);
  }
}

export = Line;
