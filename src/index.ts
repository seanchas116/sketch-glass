require("setimmediate");
import CanvasController from './controller/CanvasController';

document.addEventListener('DOMContentLoaded', () => {
  var controller = new CanvasController();
  document.body.appendChild(controller.element);
});
