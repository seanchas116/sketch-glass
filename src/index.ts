require("setimmediate");
import CanvasController from './controller/CanvasController';

document.addEventListener('DOMContentLoaded', () => {
  const controller = new CanvasController();
  document.body.appendChild(controller.element);
});
