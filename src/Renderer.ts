'use strict';

import _ from 'lodash';
import Point from './Point';
import Rect from './Rect';
import Transform from './Transform';
import Stroke from './Stroke';
import Background from "./Background";
import FillShader from "./FillShader";

var TILE_SIZE = 128;

interface RendererOptions {
  background: Background;
}

export default
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
    var gl = this.gl = <WebGLRenderingContext>(this.element.getContext("webgl", {
      alpha: false,
      antialias: false,
      depth: false,
      premultipliedAlpha: true
    }));
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
    shader.setViewportTransform(this.viewportTransform);
    shader.setSceneTransform(this.transform);

    this.strokes.forEach((stroke) => {
      shader.setColor(stroke.color);
      gl.bindBuffer(gl.ARRAY_BUFFER, stroke.buffer);
      gl.vertexAttribPointer(this.shader.aPosition, 2, gl.FLOAT, false, 0, 0);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, stroke.polygon.length);
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
