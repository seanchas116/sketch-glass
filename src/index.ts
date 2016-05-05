require("setimmediate");
require("whatwg-fetch");
require("babel-regenerator-runtime");

import MainView from './view/MainView';

async function initApp() {
  new MainView(document.getElementById("root"));
}

document.addEventListener("DOMContentLoaded", initApp);
