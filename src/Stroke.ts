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

  curves: Curve[] = [];
  finalizedBoundingRect = Rect.empty;
  lastCurveBoundingRect = Rect.empty;

  get boundingRect() {
    return this.finalizedBoundingRect.union(this.lastCurveBoundingRect);
  }

  addPoint(point: Point) {
    this.points.push(point);

    var count = this.points.length;

    if (count === 1) {
      var radius = this.width * 0.5;
      var rect = new Rect(point.sub(new Point(radius, radius)), point.add(new Point(radius, radius)));
      this.finalizedBoundingRect = this.lastCurveBoundingRect = rect;
    }
    else {
      if (count >= 3) {
        var curve = this.curves[count - 3] = this.curveAt(count - 3);

        var rect = curve.boundingRect.outset(this.width * 0.5);
        this.finalizedBoundingRect = this.finalizedBoundingRect.union(rect);
      }

      if (count >= 2) {
        var curve = this.curveAt(count - 2);
        this.curves.push(curve);

        this.lastCurveBoundingRect = curve.boundingRect.outset(this.width * 0.5);
      }
    }
  }

  curveAt(i: number) {
    var prev = this.points[i - 1];
    var start = this.points[i];
    var end = this.points[i + 1];
    var next = this.points[i + 2];

    return Curve.bSpline(prev || start, start, end, next || end);
  }
}

export = Stroke;
