'use strict';

require("setimmediate");
import CanvasController = require('./CanvasController');

document.addEventListener('DOMContentLoaded', () => {
  var controller = new CanvasController();
  document.body.appendChild(controller.element);
});
