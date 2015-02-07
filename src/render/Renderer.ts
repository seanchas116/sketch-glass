/// <reference path="../../typings/bundle.d.ts" />
'use strict';

import Scene = require('./Scene');
import Polygon = require('./Polygon');
import FillShader = require('./FillShader');

var glMatrix = require('gl-matrix');
var mat3 = glMatrix.mat3;
var vec2 = glMatrix.vec2;
var vec4 = glMatrix.vec4;

class Renderer {

  gl: WebGLRenderingContext;
  scene: Scene;
  shader: FillShader;
  width = 0;
  height = 0;

  constructor(gl: WebGLRenderingContext) {
    this.gl = gl;
    this.shader = new FillShader(gl);
    this.shader.setColor(vec4.fromValues(0, 0, 0, 1));
    gl.clearColor(0, 1, 1, 1);
  }

  resize(width: number, height: number) {
    this.width = width;
    this.height = height;
    this.clear();
    if (this.scene) {
      this.render(this.scene.polygons);
    }
  }

  setScene(scene: Scene) {
    this.scene = scene;
    scene.whenRenderRequested.subscribe(this.render.bind(this));
    scene.whenClearRequested.subscribe(this.clear.bind(this));
  }

  clear() {
    var gl = this.gl;
    this.gl.clear(gl.COLOR_BUFFER_BIT);
  }

  render(polygons: Polygon[]) {
    var gl = this.gl;
    this.shader.use();
    this.shader.setViewportTransform(this.createViewportTransform());
    this.shader.setSceneTransform(this.scene.createTransform());
    polygons.forEach((polygon) => {
      gl.bindBuffer(gl.ARRAY_BUFFER, polygon.buffer);
      gl.vertexAttribPointer(this.shader.aPosition, 2, gl.FLOAT, false, 0, 0);
      gl.drawArrays(gl.TRIANGLE_FAN, 0, polygon.vertices.length);
    });
  }

  createViewportTransform() {
    // view coord -> normalized coord
    var mat = mat3.create();
    mat3.scale(mat, mat, vec2.fromValues(1, -1));
    mat3.translate(mat, mat, vec2.fromValues(-1, -1));
    mat3.scale(mat, mat, vec2.fromValues(2, 2));
    mat3.scale(mat, mat, vec2.fromValues(1 / this.width, 1 / this.height));
    return mat;
  }
}

export = Renderer;
