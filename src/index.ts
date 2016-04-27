require("setimmediate");
require("whatwg-fetch");
require("babel-polyfill");
import MainView from './view/MainView';
import * as Auth from "./Auth";

document.addEventListener('DOMContentLoaded', () => {
  new MainView(document.getElementById("root"));
  Auth.authWithCallbackParams();
});
