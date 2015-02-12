'use strict';

import Point = require('./Point');

class Rect {
  min: Point;
  max: Point;

  constructor(min: Point, max: Point) {
    this.min = min;
    this.max = max;
  }

  get x() {
    return this.min.x;
  }
  get y() {
    return this.min.y;
  }

  get width() {
    return this.max.x - this.min.x;
  }
  get height() {
    return this.max.y - this.min.y;
  }

  union(other: Rect) {
    var min = new Point(Math.min(this.min.x, other.min.x), Math.min(this.min.y, other.min.y));
    var max = new Point(Math.max(this.max.x, other.max.x), Math.max(this.max.y, other.max.y));
    return new Rect(min, max);
  }

  outset(offset: number) {
    var diff = new Point(offset, offset);
    return new Rect(this.min.sub(diff), this.max.add(diff));
  }

  transform(transform: Transform) {
    var p1 = this.min.transform(transform);
    var p2 = this.max.transform(transform);

    return Rect.fromPoints(p1, p2);
  }

  boundingIntegerRect() {
    return new Rect(this.min.floor(), this.max.ceil());
  }

  toString() {
    return `Rect(${this.min},${this.max})`
  }

  static fromPoints(p1: Point, p2: Point) {
    var min = new Point(Math.min(p1.x, p2.x), Math.min(p1.y, p2.y));
    var max = new Point(Math.max(p1.x, p2.x), Math.max(p1.y, p2.y));
    return new Rect(min, max);
  }

  static empty() {
    return new Rect(new Point(0,0), new Point(0,0));
  }
}

export = Rect;

import Transform = require('./Transform');
