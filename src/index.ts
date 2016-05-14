require("setimmediate");
require("whatwg-fetch");
require("babel-regenerator-runtime");

import MainView from './view/MainView';

async function initApp() {
    new MainView({}).showInRoot();
}

document.addEventListener("DOMContentLoaded", initApp);
