require("setimmediate");
require("whatwg-fetch");
require("babel-regenerator-runtime");

import MainView from './view/MainView';
import * as GoogleAPI from "./lib/GoogleAPI";
import * as Auth from "./Auth";

async function initApp() {
  new MainView(document.getElementById("root"));
  await GoogleAPI.init();
  await GoogleAPI.load("auth:client,drive-realtime");
  await Auth.check();
}

document.addEventListener("DOMContentLoaded", initApp);
