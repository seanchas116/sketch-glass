require("setimmediate");
require("whatwg-fetch");
require("babel-regenerator-runtime");

import MainView from './view/MainView';

async function initApp() {
    MainView.newInRoot();
}

document.addEventListener("DOMContentLoaded", initApp);
