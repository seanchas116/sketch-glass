'use strict';

class Point {
  x: number;
  y: number;

  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
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

  get length() {
    return Math.sqrt(this.x * this.x + this.y * this.y);
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
}

export = Point;

import Transform = require('./Transform');
