/// <reference path="../typings/bundle.d.ts" />
'use strict';

import _ = require('lodash');
import Renderer = require('./Renderer');
import Point = require('./Point');
import Transform = require('./Transform');
import Stroke = require('./Stroke');
import Color = require('./Color');

class Board {

  renderer: Renderer;
  currentStroke: Stroke;
  isStroking = false;
  strokeWidth = 2;
  strokeColor = new Color(0,0,0,1);

  set transform(transform: Transform) {
    this.renderer.transform = transform;
  }
  get transform() {
    return this.renderer.transform;
  }

  constructor(renderer: Renderer) {
    this.renderer = renderer;
  }

  mapPos(pos: Point) {
    return this.transform.invert().transform(pos);
  }

  beginStroke(pos: Point) {
    pos = this.mapPos(pos);
    this.isStroking = true;
    var stroke = this.currentStroke = new Stroke();
    stroke.width = this.strokeWidth;
    stroke.color = this.strokeColor;
    stroke.points.push(pos);

    var immediateStroke = this.renderer.immediateStroke = new Stroke();
    immediateStroke.width = stroke.width;
    immediateStroke.color = stroke.color;
    immediateStroke.points.push(pos);
  }

  strokeTo(pos: Point) {
    pos = this.mapPos(pos);
    if (this.isStroking) {
      var immediateStroke = this.renderer.immediateStroke;

      if (immediateStroke.points.length === 0) {
        immediateStroke.points.push(_.last(this.currentStroke.points));
      }
      immediateStroke.points.push(pos);
      this.currentStroke.points.push(pos);
      this.renderer.updateImmediate();
    }
  }

  endStroke() {
    this.renderer.add(this.currentStroke);
    this.renderer.updateImmediate();
    this.isStroking = false;
  }

  cancelStroke() {
    this.renderer.update();
    this.isStroking = false;
  }
}

export = Board;
