/// <reference path="../typings/bundle.d.ts" />
'use strict';

import Renderer = require('./Renderer');

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
    var devicePixelRatio = window.devicePixelRatio || 1;
    console.log(`resized to ${width} * ${height}, pixel ratio ${devicePixelRatio}`);
    this.view.width = width * devicePixelRatio;
    this.view.height = height * devicePixelRatio;
    this.renderer.devicePixelRatio = devicePixelRatio;
    this.renderer.update();
  }
}

export = RenderViewController;
