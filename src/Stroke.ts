'use strict';

import Point from './Point';
import Curve from './Curve';
import Color from './Color';
import Rect from './Rect';
import _ from 'lodash';

export default
class Stroke {
  points: Point[] = [];
  color = new Color(0,0,0,1);
  width = 1;
  type = "pen";
  polygon: Point[] = [];
  gl: WebGLRenderingContext;
  buffer: WebGLBuffer;

  constructor(gl: WebGLRenderingContext) {
    this.gl = gl;
    this.buffer = gl.createBuffer();
  }

  addPoint(point: Point) {
    this.points.push(point);

    if (this.points.length >= 2) {
      var last = this.points[this.points.length - 2];
      var normal = point.sub(last).normalize().rotate90();
      var toLeft = normal.mul(this.width / 2);
      var toRight = normal.mul(-this.width / 2);
      this.polygon.push(last.add(toLeft));
      this.polygon.push(last.add(toRight));
      this.polygon.push(point.add(toLeft));
      this.polygon.push(point.add(toRight));
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
}
