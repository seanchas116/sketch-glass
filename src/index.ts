require("setimmediate");
require("babel-polyfill");
import MainView from './view/MainView';

document.addEventListener('DOMContentLoaded', () => {
  new MainView(document.getElementById("root"));
});
