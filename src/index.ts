require("setimmediate");
import CanvasViewController from './viewcontroller/CanvasViewController';
import AppViewModel from "./viewmodel/AppViewModel";

document.addEventListener('DOMContentLoaded', () => {
  new CanvasViewController(document.querySelector(".sg-canvas") as HTMLElement, AppViewModel.instance.canvasViewModel);
});
