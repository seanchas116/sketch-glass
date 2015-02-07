/// <reference path="../../typings/bundle.d.ts" />
'use strict';

import Polygon = require('./Polygon');
import _ = require('lodash');
import Rx = require('rx');

var glMatrix = require('gl-matrix');
var mat3 = glMatrix.mat3;
var vec2 = glMatrix.vec2;

class Scene {

  gl: WebGLRenderingContext;
  polygons: Polygon[] = [];
  immediatePolygons: Polygon[] = [];

  scrollX = 0;
  scrollY = 0;
  scale = 1;

  whenRenderRequested = new Rx.Subject<Polygon[]>();
  whenClearRequested = new Rx.Subject<Scene>();

  constructor(gl: WebGLRenderingContext) {
    this.gl = gl;
  }

  add(polygon: Polygon) {
    polygon.load();
    this.polygons.push(polygon);
  }

  remove(polygon: Polygon) {
    _.remove(this.polygons, p => p === polygon);
    polygon.unload();
  }

  renderImmediate(polygon: Polygon) {
    polygon.load();
    this.immediatePolygons.push(polygon);

    requestAnimationFrame(() => {
      this.whenRenderRequested.onNext(this.immediatePolygons);
      this.immediatePolygons.forEach(polygon => {
        polygon.unload();
      });
      this.immediatePolygons = [];
    });
  }

  update() {
    requestAnimationFrame(() => {
      this.whenClearRequested.onNext(this);
      this.whenRenderRequested.onNext(this.polygons);
    });
  }

  createTransform() {
    var mat = mat3.create();
    mat3.scale(mat, mat, vec2.fromValues(this.scale, this.scale));
    mat3.translate(mat, mat, vec2.fromValues(this.scrollX, this.scrollY));
    return mat;
  }
}

export = Scene;
