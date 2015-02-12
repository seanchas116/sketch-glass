'use strict';

import Point = require('./Point');
import Curve = require('./Curve');
import Color = require('./Color');
import Rect = require('./Rect');
import _ = require('lodash');

class Stroke {
  points: Point[] = [];
  color = new Color(0,0,0,1);
  composition = 'source-over';
  width = 1;

  toCurves() {
    if (this.points.length <= 1) {
      return [];
    }
    return _.times(this.points.length - 1, i => this.curveAt(i + 1));
  }

  boundingRect() {
    if (this.points.length === 0) {
      return Rect.empty();
    }
    else if (this.points.length === 1) {
      var p = this.points[0];
      var radius = this.width * 0.5;
      return new Rect(p.sub(new Point(radius, radius)), p.add(new Point(radius, radius)));
    }
    else {
      return this.toCurves()
        .map(curve => curve.boundingRect())
        .reduce((union, rect) => union.union(rect))
        .outset(this.width * 0.5);
    }
  }

  curveAt(i: number) {
    var prev = this.points[i - 2];
    var start = this.points[i - 1];
    var end = this.points[i];
    var next = this.points[i + 1];

    return Curve.bSpline(prev || start, start, end, next || end);
  }
}

export = Stroke;
