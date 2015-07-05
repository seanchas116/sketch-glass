'use strict';

import Point = require('./Point');
import Curve = require('./Curve');
import Color = require('./Color');
import Rect = require('./Rect');
import QuadraticCurve = require("./QuadraticCurve");
import Line = require("./Line");
import util = require("./util");
import Transform = require("./Transform");
import _ = require('lodash');
import Rx = require("rx");

var arrayPush = Array.prototype.push;

class Stroke {
  points: Point[] = [];
  color = new Color(0,0,0,1);
  width = 1;
  type = "pen";
  curves: Curve[] = [];
  whenPush = new Rx.Subject<Curve>();
  whenPop = new Rx.Subject<void>();
  whenUpdate = new Rx.Subject<void>();

  addPoint(point: Point) {
    this.points.push(point);

    var count = this.points.length;

    if (count >= 3) {
      this._popCurve();
      // recalculate last curve
      this._pushCurve(this._curveAt(count - 3));
    }
    if (count >= 2) {
      // push curve
      this._pushCurve(this._curveAt(count - 2));
    }
    this.whenUpdate.onNext(null);
  }

  _curveAt(i: number) {
    var prev = this.points[i - 1];
    var start = this.points[i];
    var end = this.points[i + 1];
    var next = this.points[i + 2];

    return Curve.bSpline(prev || start, start, end, next || end);
  }

  _pushCurve(curve: Curve) {
    this.curves.push(curve);
    this.whenPush.onNext(curve);
  }

  _popCurve() {
    this.curves.pop();
    this.whenPop.onNext(null);
  }
}

export = Stroke;
