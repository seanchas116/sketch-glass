/// <reference path="../typings/bundle.d.ts" />
'use strict';

import Point = require('./Point');
import Rect = require('./Rect');
import Transform = require('./Transform');
import Stroke = require('./Stroke');

class RendererTile {

  element: HTMLCanvasElement;
  context: CanvasRenderingContext2D;
  rect = Rect.empty;
  rendererTransform = Transform.identity();
  transform = Transform.identity();
  isActive = false;
  renderingRect = Rect.empty;

  constructor(rect: Rect) {
    this.rect = rect;
    var elem = this.element = document.createElement('canvas');
    elem.width = rect.width;
    elem.height = rect.height;

    var dpr = window.devicePixelRatio || 0;

    elem.className = 'canvas-area__renderer-tile'
    var style = elem.style;
    var styleAny: any = style;
    style.left = `${rect.x / dpr}px`
    style.top = `${rect.y / dpr}px`
    style.width = `${rect.width / dpr}px`;
    style.height = `${rect.height / dpr}px`;

    this.context = elem.getContext('2d');
    this.context.save();
  }

  setRendererTransform(transform: Transform) {
    this.rendererTransform = transform;
    this.transform = transform.translate(this.rect.min.negate());
  }

  // clear and clip
  beginRendering(rect: Rect) {

    var clearRect = this.rect.intersection(rect);
    if (clearRect.isEmpty) {
      this.renderingRect = Rect.empty;
      return;
    }


    var renderingRect = this.renderingRect = clearRect.translate(this.rect.min.negate());

    var context = this.context;
    //context.setTransform(1, 0, 0, 1, 0, 0);
    context.restore();
    context.save();

    if (this.isActive) {
      context.clearRect(renderingRect.x, renderingRect.y, renderingRect.width, renderingRect.height);

      if (clearRect.equals(this.rect)) {
        this.isActive = false;
      }
    }

    context.beginPath();
    context.rect(renderingRect.x, renderingRect.y, renderingRect.width, renderingRect.height);
    context.closePath();
    context.clip();
  }

  drawOther(other: RendererTile) {
    if (!other.isActive) {
      return;
    }

    this.isActive = true;

    var context = this.context;
    context.setTransform(1, 0, 0, 1, 0, 0);

    var offset = other.rect.min.sub(this.rect.min);

    context.drawImage(other.element, offset.x, offset.y);
  }

  drawStroke(stroke: Stroke) {
    if (this.renderingRect.isEmpty) {
      return;
    }

    var strokeRect = stroke.boundingRect.transform(this.rendererTransform);
    if (this.rect.intersection(strokeRect).isEmpty) {
      return;
    }

    this.isActive = true;

    var count = stroke.points.length;
    if (count === 0) {
      return;
    }

    var context = this.context;
    context.globalCompositeOperation = stroke.composition;
    context.lineCap = 'round';
    context.lineJoin = 'round';

    var t = this.transform;
    context.setTransform(t.m11, t.m12, t.m21, t.m22, t.dx, t.dy);

    var startPos = stroke.points[0];

    if (count === 1) {
      context.fillStyle = stroke.color.toString();
      context.beginPath();
      context.arc(startPos.x, startPos.y, stroke.width / 2, 0, Math.PI * 2);
      context.fill();
    }
    if (count > 1) {
      context.lineWidth = stroke.width;
      context.strokeStyle = stroke.color.toString();
      context.beginPath();

      context.moveTo(startPos.x, startPos.y);
      stroke.curves.forEach(curve => {
        context.bezierCurveTo(
          curve.control1.x, curve.control1.y,
          curve.control2.x, curve.control2.y,
          curve.end.x, curve.end.y
        );
      });

      context.stroke();
    }
  }
}

export = RendererTile;
