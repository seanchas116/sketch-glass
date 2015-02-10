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

  mult(a: number) {
    return new Point(this.x * a, this.y * a);
  }

  div(a: number) {
    return new Point(this.x / a, this.y / a);
  }

  get length() {
    return Math.sqrt(this.x * this.x + this.y * this.y);
  }
}

export = Point;
