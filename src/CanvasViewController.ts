/// <reference path="../typings/bundle.d.ts" />
'use strict';

import Renderer = require('./Renderer');
import Stroke = require('./Stroke');
import Point = require('./Point');
import Color = require('./Color');
import Transform = require('./Transform');
import _ = require('lodash');

function touchPoint(touch: Touch) {
  return new Point(touch.clientX, touch.clientY);
}

enum InteractionState {
  None, Pressed, Pinching
}

class CanvasViewController {

  view: HTMLElement;

  renderer: Renderer;
  currentStrokeRenderer: Renderer;

  interactionState = InteractionState.None;
  pinchStartPoints: Point[];

  transform = Transform.identity();
  initialTransform = Transform.identity();

  currentStroke: Stroke;
  isStroking = false;
  strokeWidth = 2;
  strokeColor = new Color(0,0,0,1);

  constructor() {

    this.renderer = new Renderer();
    this.currentStrokeRenderer = new Renderer();

    var view = this.view = document.createElement('div');
    view.style.width = '100%';
    view.style.height = '100%';
    view.appendChild(this.renderer.view);
    view.appendChild(this.currentStrokeRenderer.view);

    view.addEventListener('mousemove', this.onMouseMove.bind(this));
    view.addEventListener('mousedown', this.onMouseDown.bind(this));
    view.addEventListener('mouseup', this.onMouseUp.bind(this));

    view.addEventListener('touchmove', this.onTouchMove.bind(this));
    view.addEventListener('touchstart', this.onTouchStart.bind(this));
    view.addEventListener('touchend', this.onTouchEnd.bind(this));

    view.addEventListener('wheel', this.onWheel.bind(this));
  }

  pinchStart(points: Point[]) {
    this.interactionState = InteractionState.Pinching;
    this.pinchStartPoints = points;
    this.initialTransform = this.transform;
  }

  pinchMove(points: Point[]) {
    if (this.interactionState !== InteractionState.Pinching) {
      this.pinchStart(points);
    }

    var scale = points[0].sub(points[1]).length / this.pinchStartPoints[0].sub(this.pinchStartPoints[1]).length;

    var centerStart = this.pinchStartPoints[0].add(this.pinchStartPoints[1]).mul(0.5);
    var center = points[0].add(points[1]).mul(0.5);

    var diff = center.sub(centerStart.mul(scale));

    var transform = Transform.scale(scale).merge(Transform.translation(diff));

    var transform = this.initialTransform.merge(transform);
    this.updateTransform(transform);
    this.renderer.update();
  }

  pinchEnd() {
    this.interactionState = InteractionState.None;
  }

  pressStart(pos: Point) {
    this.interactionState = InteractionState.Pressed;

    pos = this.transform.invert().transform(pos);
    var stroke = this.currentStroke = new Stroke();
    stroke.width = this.strokeWidth;
    stroke.color = this.strokeColor;
    stroke.points.push(pos);

    this.currentStrokeRenderer.strokes = [stroke];
  }

  pressMove(pos: Point) {
    if (this.interactionState === InteractionState.Pressed) {
      pos = this.transform.invert().transform(pos);
      this.currentStroke.points.push(pos);
      this.currentStrokeRenderer.render();
    }
  }

  pressEnd() {
    if (this.interactionState === InteractionState.Pressed) {
      this.renderer.strokes.push(this.currentStroke);
      this.renderer.drawOther(this.currentStrokeRenderer);
      this.currentStrokeRenderer.strokes = [];
      this.currentStrokeRenderer.render();

      this.interactionState = InteractionState.None;
    }
  }

  updateTransform(transform: Transform) {
    this.transform = transform;
    this.renderer.transform = transform;
    this.currentStrokeRenderer.transform = transform;
  }

  onMouseMove(ev: MouseEvent) {
    //console.log(`mouse move at ${ev.clientX}, ${ev.clientY}`);
    this.pressMove(new Point(ev.clientX, ev.clientY));
  }
  onMouseDown(ev: MouseEvent) {
    //console.log(`mouse down at ${ev.clientX}, ${ev.clientY}`);
    this.pressStart(new Point(ev.clientX, ev.clientY));
  }
  onMouseUp(ev: MouseEvent) {
    //console.log(`mouse up at ${ev.clientX}, ${ev.clientY}`);
    this.pressEnd();
  }

  onTouchMove(ev: TouchEvent) {
    if (ev.touches.length === 1) {
      var touch = ev.touches[0];
      this.pressMove(touchPoint(touch));
    }
    else if (ev.touches.length === 2) {
      this.pinchMove([0,1].map(i => touchPoint(ev.touches[i])));
    }
    ev.preventDefault();
  }
  onTouchStart(ev: TouchEvent) {
    if (ev.touches.length === 1) {
      var touch = ev.touches[0];
      this.pressStart(touchPoint(touch));
    }
    else if (ev.touches.length === 2) {
      this.pinchStart([0,1].map(i => touchPoint(ev.touches[i])));
    }
    ev.preventDefault();
  }
  onTouchEnd(ev: TouchEvent) {
    this.pressEnd();
    this.pinchEnd();
    ev.preventDefault();
  }

  onWheel(ev: WheelEvent) {
    var transform = this.transform.translate(new Point(-ev.deltaX, -ev.deltaY));
    this.updateTransform(transform);
    ev.preventDefault();
  }
}

export = CanvasViewController;
