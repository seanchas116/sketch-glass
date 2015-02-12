/// <reference path="../typings/bundle.d.ts" />
'use strict';

import Point = require('./Point');
import Transform = require('./Transform');
import Stroke = require('./Stroke');

class Renderer {

  view: HTMLCanvasElement;
  context: CanvasRenderingContext2D;
  strokes: Stroke[] = [];
  isRenderQueued = false;
  devicePixelRatio = 1;
  transform = Transform.identity();
  width = 0;
  height = 0;

  constructor() {
    this.view = document.createElement('canvas');
    this.context = this.view.getContext('2d');

    window.addEventListener('resize', this.onResize.bind(this));
    this.onResize();
  }

  add(stroke: Stroke) {
    this.strokes.push(stroke);
  }

  update() {
    if (!this.isRenderQueued) {
      this.isRenderQueued = true;
      requestAnimationFrame(this.render.bind(this));
    }
  }

  clear() {
    this.clearTransform();
    this.context.clearRect(0, 0, this.width * this.devicePixelRatio, this.height * this.devicePixelRatio);
    this.setTransform();
  }

  drawOther(other: Renderer) {
    this.clearTransform();
    this.context.drawImage(other.view, 0, 0);
    this.setTransform();
  }

  render() {
    this.clear();
    this.strokes.forEach(this.renderStroke.bind(this));
    this.isRenderQueued = false;
  }

  renderStroke(stroke: Stroke, smooth = true) {
    var count = stroke.points.length;
    if (count === 0) {
      return;
    }

    var context = this.context;
    context.globalCompositeOperation = stroke.composition;
    context.lineCap = 'round';
    context.lineJoin = 'round';
    this.setTransform();

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
          var curve = stroke.curveAt(i);
          context.bezierCurveTo(
            curve.control1.x, curve.control1.y,
            curve.control2.x, curve.control2.y,
            curve.end.x, curve.end.y
          );
        }
      });

      context.stroke();
    }
  }

  clearTransform() {
    this.context.setTransform(1, 0, 0, 1, 0, 0);
  }

  createTransform() {
    return this.transform.merge(Transform.scale(this.devicePixelRatio));
  }

  setTransform() {
    var t = this.createTransform();
    this.context.setTransform(t.m11, t.m12, t.m21, t.m22, t.dx, t.dy);
  }

  onResize() {
    var width = this.width = window.innerWidth;
    var height = this.height = window.innerHeight;
    var devicePixelRatio = this.devicePixelRatio = window.devicePixelRatio || 1;
    console.log(`resized to ${width} * ${height}, pixel ratio ${devicePixelRatio}`);
    this.view.width = width * devicePixelRatio;
    this.view.height = height * devicePixelRatio;
    this.update();
  }
}

export = Renderer;
