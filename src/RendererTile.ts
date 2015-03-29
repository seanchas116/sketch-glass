/// <reference path="../typings/bundle.d.ts" />
'use strict';

import Point = require('./Point');
import Rect = require('./Rect');
import Transform = require('./Transform');
import Stroke = require('./Stroke');
import Background = require("./Background");

class RendererTile {

  element: HTMLCanvasElement;
  context: CanvasRenderingContext2D;
  rect = Rect.empty;
  rendererTransform = Transform.identity();
  transform = Transform.identity();
  isBlank = true;
  renderingRect = Rect.empty;
  background: Background;

  constructor(rect: Rect, background: Background) {
    this.rect = rect;
    this.background = background;

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
    style.opacity = '0';

    this.context = elem.getContext('2d', {alpha: !background.isOpaque});
    this.context.save();

    if (background.isOpaque) {
      this.isBlank = false;
      this.clear();
    }
  }

  _clearRect(rect: Rect) {
    if (this.background.isOpaque) {
      this.context.restore();
      this.context.save();

      this.context.fillStyle = this.background.color.toString();
      this.context.fillRect(rect.x, rect.y, rect.width, rect.height);
    } else {
      this.context.clearRect(rect.x, rect.y, rect.width, rect.height);
    }
  }

  setRendererTransform(transform: Transform) {
    this.rendererTransform = transform;
    this.transform = transform.translate(this.rect.min.negate());
  }

  clear() {
    if (this.isBlank) {
      return;
    }
    this.context.restore();
    this.context.save();
    this._clearRect(Rect.fromMetrics(0, 0, this.rect.width, this.rect.height));

    this.element.style.opacity = '0';
    this.isBlank = true;
  }

  activate() {
    this.element.style.opacity = '1';
    this.isBlank = false;
  }

  // clear and clip
  beginRendering(rect: Rect, clear = true) {

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

    if (!this.isBlank && clear) {
      this._clearRect(renderingRect);

      if (clearRect.equals(this.rect)) {
        this.isBlank = true;
      }
    }

    context.beginPath();
    context.rect(renderingRect.x, renderingRect.y, renderingRect.width, renderingRect.height);
    context.closePath();
    context.clip();
  }

  drawOther(other: RendererTile) {
    if (other.isBlank) {
      return;
    }

    this.activate();

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

    this.activate();

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
