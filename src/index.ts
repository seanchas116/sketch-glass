require("setimmediate");
import CanvasViewController from './viewcontroller/CanvasViewController';

document.addEventListener('DOMContentLoaded', () => {
  new CanvasViewController(document.querySelector(".sg-canvas") as HTMLElement);
});
