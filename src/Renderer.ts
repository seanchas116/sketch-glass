/// <reference path="../typings/bundle.d.ts" />
'use strict';

import _ = require('lodash');
import Point = require('./Point');
import Rect = require('./Rect');
import Transform = require('./Transform');
import Stroke = require('./Stroke');
import Background = require("./Background");
import FillShader = require("./FillShader");

var TILE_SIZE = 128;

interface RendererOptions {
  background: Background;
}

class Renderer {

  element = document.createElement('canvas');
  strokes: Stroke[] = [];
  isUpdateQueued = false;
  devicePixelRatio = 1;
  width = 0;
  height = 0;
  background: Background;
  transform = Transform.identity();
  gl: WebGLRenderingContext;
  viewportTransform: Transform;
  shader: FillShader;

  constructor(opts: RendererOptions) {
    var gl = this.gl = this.element.getContext("webgl", {
      alpha: false,
      antialias: false,
      depth: false,
      premultipliedAlpha: true
    });
    if (!gl.getExtension("OES_standard_derivatives")) {
      console.warn("OES_standard_derivatives not supported");
    }
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);

    this.shader = new FillShader(gl);

    this.background = opts.background;
    var backColor = this.background.color;
    gl.clearColor(backColor.r, backColor.g, backColor.b, backColor.a);

    this.element.className = 'canvas-area__renderer';
    window.addEventListener('resize', this.onResize.bind(this));
    this.onResize();
  }

  addStroke(stroke: Stroke) {
    this.strokes.push(stroke);
  }

  newStroke() {
    return new Stroke(this.gl);
  }

  update(immediate = false) {
    if (!this.isUpdateQueued) {
      this.isUpdateQueued = true;
      var callback = () => {
        this.render();
        this.isUpdateQueued = false;
      };
      if (immediate) {
        setImmediate(callback);
      } else {
        requestAnimationFrame(callback);
      }
    }
  }

  render() {
    var gl = this.gl;
    var shader = this.shader;
    gl.clear(gl.COLOR_BUFFER_BIT);

    shader.use();
    shader.setTransforms(this.viewportTransform, this.transform);

    this.strokes.forEach((stroke) => {
      shader.setColor(stroke.color);
      shader.setWidth(stroke.width * this.transform.m11);
      gl.bindBuffer(gl.ARRAY_BUFFER, stroke.vertexBuffer);
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, stroke.indexBuffer);
      gl.vertexAttribPointer(this.shader.aPosition, 2, gl.FLOAT, false, 16, 0);
      gl.vertexAttribPointer(this.shader.aUVCoord, 2, gl.FLOAT, false, 16, 8);
      gl.drawElements(gl.TRIANGLES, stroke.indices.length, gl.UNSIGNED_SHORT, 0);
    });
  }

  onResize() {
    var width = this.width = window.innerWidth;
    var height = this.height = window.innerHeight;
    var dpr = this.devicePixelRatio = window.devicePixelRatio || 1;

    this.viewportTransform = Transform.scale(2 / width, 2 / height)
      .translate(new Point(-1, -1))
      .scale(1, -1);
    this.element.width = width * dpr;
    this.element.height = height * dpr;

    this.gl.viewport(0, 0, width * dpr, height * dpr);

    console.log(`resized to ${width} * ${height}, pixel ratio ${devicePixelRatio}`);

    this.update();
  }
}

export = Renderer;
