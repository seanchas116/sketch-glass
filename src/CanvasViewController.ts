/// <reference path="../typings/bundle.d.ts" />
'use strict';

import RenderViewController = require('./RenderViewController');
import Board = require('./Board');

interface Point {
  x: number;
  y: number;
}

class CanvasViewController {

  view: HTMLElement;
  board: Board;
  isPressed: boolean;

  constructor() {
    var renderViewController = new RenderViewController();
    var view = this.view = renderViewController.view;

    this.board = new Board(renderViewController.renderer);

    view.addEventListener('mousemove', this.onMouseMove.bind(this));
    view.addEventListener('mousedown', this.onMouseDown.bind(this));
    view.addEventListener('mouseup', this.onMouseUp.bind(this));

    view.addEventListener('touchmove', this.onTouchMove.bind(this));
    view.addEventListener('touchstart', this.onTouchStart.bind(this));
    view.addEventListener('touchend', this.onTouchEnd.bind(this));
  }

  onMouseMove(ev: MouseEvent) {
    //console.log(`mouse move at ${ev.clientX}, ${ev.clientY}`);
    if (this.isPressed) {
      this.board.strokeTo({x: ev.clientX, y: ev.clientY});
    }
  }
  onMouseDown(ev: MouseEvent) {
    //console.log(`mouse down at ${ev.clientX}, ${ev.clientY}`);
    this.board.beginStroke({x: ev.clientX, y: ev.clientY});
    this.isPressed = true;
  }
  onMouseUp(ev: MouseEvent) {
    //console.log(`mouse up at ${ev.clientX}, ${ev.clientY}`);
    this.isPressed = false;
    this.board.endStroke();
  }

  onTouchMove(ev: any) {
    if (this.isPressed && ev.touches.length == 1) {
      var touch = ev.touches[0];
      this.board.strokeTo({x: touch.clientX, y: touch.clientY});
    }
    ev.preventDefault();
  }
  onTouchStart(ev: any) {
    if (ev.touches.length == 1) {
      var touch = ev.touches[0];
      this.board.beginStroke({x: touch.clientX, y: touch.clientY});
      this.isPressed = true;
    }
    ev.preventDefault();
  }
  onTouchEnd(ev: any) {
    this.isPressed = false;
    this.board.endStroke();
    ev.preventDefault();
  }
}

export = CanvasViewController;
