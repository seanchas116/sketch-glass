/// <reference path="../typings/bundle.d.ts" />
'use strict';

import _ = require('lodash');
import Renderer = require('./Renderer');
import Point = require('./Point');
import Stroke = require('./Stroke');
import Color = require('./Color');

class Board {

  renderer: Renderer;
  currentStroke: Stroke;
  strokeWidth = 2;
  strokeColor = new Color(0,0,0,1);

  constructor(renderer: Renderer) {
    this.renderer = renderer;
  }

  beginStroke(pos: Point) {
    var stroke = this.currentStroke = new Stroke();
    stroke.width = this.strokeWidth;
    stroke.color = this.strokeColor;

    var immediateStroke = this.renderer.immediateStroke = new Stroke();
    immediateStroke.width = stroke.width;
    immediateStroke.color = stroke.color;
    immediateStroke.points.push(pos);
  }

  strokeTo(pos: Point) {
    if (this.currentStroke) {
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
    this.currentStroke = null;
  }
}

export = Board;
