'use strict';

import Point = require('./Point');
import Rect = require('./Rect');
var Bezier = require('bezier-js');

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

  midpoint() {
    var xy = this._bezier().get(0.5);
    return new Point(xy.x, xy.y);
  }

  divide() {
    var p1 = this.start;
    var c1 = this.control1;
    var c2 = this.control2;
    var p2 = this.end;

    var cm = c1.midpoint(c2);
    var c11 = p1.midpoint(c1);
    var c12 = c11.midpoint(cm);

    var c22 = p2.midpoint(c2);
    var c21 = c22.midpoint(cm);

    var mid = c12.midpoint(c21);

    return [
      new Curve(p1, c11, c12, mid),
      new Curve(mid, c21, c22, p2)
    ];
  }

  calcBoundingRect() {
    var bbox = this._bezier().bbox();
    return new Rect(new Point(bbox.x.min, bbox.y.min), new Point(bbox.x.max, bbox.y.max));
  }

  _bezier() {
    return new Bezier([this.start, this.control1, this.control2, this.end]);
  }

  toString() {
    return `Curve(${this.start},${this.control1},${this.control2},${this.end})`;
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
