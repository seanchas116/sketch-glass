/// <reference path="../typings/bundle.d.ts" />
'use strict';

import Point = require('./Point');
import Stroke = require('./Stroke');

class Renderer {

  context: CanvasRenderingContext2D;
  strokes: Stroke[] = [];
  immediateStroke = new Stroke();
  isRenderQueued = false;
  devicePixelRatio = 1;

  constructor(context: CanvasRenderingContext2D) {
    this.context = context;
  }

  add(stroke: Stroke) {
    this.strokes.push(stroke);
  }

  updateImmediate() {
    //requestAnimationFrame(() => {
      this.renderStroke(this.immediateStroke);
      this.immediateStroke.points = [];
    //});
  }

  update() {
    if (!this.isRenderQueued) {
      this.isRenderQueued = true;
      requestAnimationFrame(this.render.bind(this));
    }
  }

  render() {
    this.strokes.forEach(this.renderStroke.bind(this));
    this.isRenderQueued = false;
  }

  renderStroke(stroke: Stroke) {
    var count = stroke.points.length;
    if (count === 0) {
      return;
    }

    var context = this.context;
    context.globalCompositeOperation = stroke.composition;
    context.setTransform.apply(context, this.getTransform());
    context.lineCap = 'round';
    context.lineJoin = 'round';

    if (count === 1) {
      var pos = stroke.points[0];
      context.fillStyle = stroke.color.toString();
      context.beginPath();
      context.arc(pos.x, pos.y, stroke.width / 2, 0, Math.PI * 2);
      context.fill();
    }
    if (count > 1) {
      context.lineWidth = stroke.width;
      context.strokeStyle = stroke.color.toString();
      context.beginPath();

      stroke.points.forEach((pos, i) => {
        if (i === 0) {
          context.moveTo(pos.x, pos.y);
        }
        else {
          context.lineTo(pos.x, pos.y);
        }
      });

      context.stroke();
    }
  }

  getTransform() {
    var scale = this.devicePixelRatio;
    return [ scale, 0, 0, scale, 0, 0];
  }
}

export = Renderer;
