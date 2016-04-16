require("setimmediate");
import MainView from './view/MainView';

document.addEventListener('DOMContentLoaded', () => {
  new MainView(document.getElementById("root"));
});
