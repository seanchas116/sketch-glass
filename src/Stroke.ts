'use strict';

import Point = require('./Point');
import Curve = require('./Curve');
import Color = require('./Color');
import Rect = require('./Rect');
import QuadraticCurve = require("./QuadraticCurve");
import _ = require('lodash');

class Stroke {
  points: Point[] = [];
  color = new Color(0,0,0,1);
  width = 1;
  type = "pen";
  polygon: Point[] = [];
  gl: WebGLRenderingContext;
  buffer: WebGLBuffer;
  lastPolygonCount = 0;

  constructor(gl: WebGLRenderingContext) {
    this.gl = gl;
    this.buffer = gl.createBuffer();
  }

  addPoint(point: Point) {
    this.points.push(point);

    var count = this.points.length;

    if (count >= 3) {
      // recalculate last curve
      this._popCurvePolygon();
      this._pushCurvePolygon(this._curveAt(count - 3));
    }
    if (count >= 2) {
      // push curve
      this._pushCurvePolygon(this._curveAt(count - 2));
    }

    this._updatePolygon();
  }

  _updatePolygon() {

    var data = new Float32Array(this.polygon.length * 2);
    this.polygon.forEach((p, i) => {
      data[i * 2] = p.x;
      data[i * 2 + 1] = p.y;
    });

    var gl = this.gl;
    gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
    gl.bufferData(gl.ARRAY_BUFFER, data, gl.DYNAMIC_DRAW);
  }

  _curveAt(i: number) {
    var prev = this.points[i - 1];
    var start = this.points[i];
    var end = this.points[i + 1];
    var next = this.points[i + 2];

    return Curve.bSpline(prev || start, start, end, next || end);
  }

  _pushCurvePolygon(curve: Curve) {
    var curves = QuadraticCurve.fromCubic(curve);
    this.lastPolygonCount = curves.length * 3;

    curves.forEach((curve) => {
      this.polygon.push(curve.start);
      this.polygon.push(curve.control);
      this.polygon.push(curve.end);
    });
  }

  _popCurvePolygon() {
    this.polygon.splice(this.polygon.length - this.lastPolygonCount, this.lastPolygonCount);
  }
}

export = Stroke;
