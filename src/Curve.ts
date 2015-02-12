'use strict';

import Point = require('./Point');
import Rect = require('./Rect');
var Bezier = require('./vendor/bezier');

class Curve {
  start: Point;
  control1: Point;
  control2: Point;
  end: Point;

  constructor(start: Point, control1: Point, control2: Point, end: Point) {
    this.start = start;
    this.control1 = control1;
    this.control2 = control2;
    this.end = end;
  }

  boundingRect() {
    var bezier = new Bezier([this.start, this.control1, this.control2, this.end]);
    var bbox = bezier.bbox();
    return new Rect(new Point(bbox.x.min, bbox.y.min), new Point(bbox.x.max, bbox.y.max));
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
}

export = Curve;
