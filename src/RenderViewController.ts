/// <reference path="../typings/bundle.d.ts" />
'use strict';

import Renderer = require('./Renderer');

//var DEVICE_PIXEL_RATIO = window.devicePixelRatio || 1;
var DEVICE_PIXEL_RATIO = 1;

class RenderViewController {

  view: HTMLCanvasElement;
  context: CanvasRenderingContext2D;
  renderer: Renderer;

  constructor() {
    this.view = document.createElement('canvas');
    this.context = this.view.getContext('2d');

    this.renderer = new Renderer(this.context);

    window.addEventListener('resize', this._resize.bind(this));
    this._resize();
  }

  _resize() {
    var width = window.innerWidth;
    var height = window.innerHeight;
    this.view.width = width * DEVICE_PIXEL_RATIO;
    this.view.height = height * DEVICE_PIXEL_RATIO;
    this.renderer.update();
  }
}

export = RenderViewController;
