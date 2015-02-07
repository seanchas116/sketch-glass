/// <reference path="../typings/bundle.d.ts" />
'use strict';

import CanvasViewController = require('./CanvasViewController');

document.addEventListener('DOMContentLoaded', () => {
  var controller = new CanvasViewController();
  document.body.appendChild(controller.view);
});
