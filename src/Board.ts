/// <reference path="../typings/bundle.d.ts" />
'use strict';

import Scene = require('./render/Scene');
import Polygon = require('./render/Polygon');
import _ = require('lodash');

var vec2 = require('gl-matrix').vec2;

class Board {

  gl: WebGLRenderingContext;
  scene: Scene;

  strokePoints: Float32Array[] = [];
  lastX = 0;
  lastY = 0;
  lineWidth = 2;

  constructor(gl: WebGLRenderingContext) {
    this.gl = gl;
    this.scene = new Scene(gl);
  }

  beginStroke(x: number, y: number) {
    this.strokePoints.push(vec2.fromValues(x, y));
  }

  strokeTo(x: number, y: number) {
    var end = vec2.fromValues(x, y);

    if (this.strokePoints.length > 0) {
      var start = _.last(this.strokePoints);

      var segment = vec2.create();
      vec2.sub(segment, end, start);
      var normal = vec2.fromValues(-segment[1], segment[0]);
      vec2.normalize(normal, normal);

      var v1 = vec2.create();
      vec2.scaleAndAdd(v1, start, normal, this.lineWidth / 2);
      var v2 = vec2.create();
      vec2.scaleAndAdd(v2, end, normal, this.lineWidth / 2);
      var v3 = vec2.create();
      vec2.scaleAndAdd(v3, end, normal, - this.lineWidth / 2);
      var v4 = vec2.create();
      vec2.scaleAndAdd(v4, start, normal, - this.lineWidth / 2);

      var polygon = new Polygon(this.gl, [v1, v2, v3, v4]);
      this.scene.renderImmediate(polygon);
    }

    this.strokePoints.push(end);
  }

  endStroke() {
    // TODO
    this.strokePoints = [];
  }
}

export = Board;
