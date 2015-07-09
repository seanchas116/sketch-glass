require("setimmediate");
require("babelify/polyfill");
import CanvasView from './view/CanvasView';
import LoginView from "./view/LoginView";

document.addEventListener('DOMContentLoaded', () => {
  const canvas = new CanvasView();
  const login = new LoginView();
  document.body.appendChild(canvas.element);
  document.body.appendChild(login.element);
});
