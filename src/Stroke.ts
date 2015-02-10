'use strict';

import Point = require('./Point');
import Curve = require('./Curve');
import Color = require('./Color');

class Stroke {
  points: Point[] = [];
  color = new Color(0,0,0,1);
  composition = 'source-over';
  width = 1;

  curveAt(i: number) {
    var prev = this.points[i - 2];
    var start = this.points[i - 1];
    var end = this.points[i];
    var next = this.points[i + 1];

    return Curve.catmullRom(prev || start, start, end, next || end);
  }
}

export = Stroke;
