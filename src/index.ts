require("setimmediate");
require("babelify/polyfill");
import CanvasController from './controller/CanvasController';
import LoginViewControler from "./controller/LoginViewController";

document.addEventListener('DOMContentLoaded', () => {
  const canvas = new CanvasController();
  const login = new LoginViewControler();
  document.body.appendChild(canvas.element);
  document.body.appendChild(login.element);
});
