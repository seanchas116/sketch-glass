/// <reference path="../typings/bundle.d.ts" />
'use strict';

import CanvasController = require('./CanvasController');

document.addEventListener('DOMContentLoaded', () => {
  var controller = new CanvasController();
  document.body.appendChild(controller.view);
});
