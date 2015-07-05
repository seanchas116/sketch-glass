require("setimmediate");
import CanvasController from './CanvasController';

document.addEventListener('DOMContentLoaded', () => {
  var controller = new CanvasController();
  document.body.appendChild(controller.element);
});
