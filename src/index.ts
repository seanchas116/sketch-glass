require("setimmediate");
require("whatwg-fetch");
require("babel-polyfill");
import MainView from './view/MainView';
import * as Auth from "./Auth";

function initApp() {
  new MainView(document.getElementById("root"));
  Auth.check();
}

window["initApp"] = initApp;
