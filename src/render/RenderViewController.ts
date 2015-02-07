/// <reference path="../../typings/bundle.d.ts" />
'use strict';

import Renderer = require('./Renderer');

//var DEVICE_PIXEL_RATIO = window.devicePixelRatio || 1;
var DEVICE_PIXEL_RATIO = 2;

class RenderViewController {

  view: HTMLCanvasElement;
  gl: WebGLRenderingContext;
  renderer: Renderer;

  constructor() {
    this.view = document.createElement('canvas');
    var gl = this.gl = this.view.getContext('webgl', { antialias: false, preserveDrawingBuffer: true });

    this.renderer = new Renderer(gl);

    window.addEventListener('resize', this._resize.bind(this));
    this._resize();
  }

  _resize() {
    var width = window.innerWidth;
    var height = window.innerHeight;
    this.view.width = width * DEVICE_PIXEL_RATIO;
    this.view.height = height * DEVICE_PIXEL_RATIO;
    this.gl.viewport(0, 0, width * DEVICE_PIXEL_RATIO, height * DEVICE_PIXEL_RATIO);
    this.renderer.resize(width, height);
  }
}

export = RenderViewController;
