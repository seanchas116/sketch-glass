require("setimmediate");
import MainView from './view/MainView';
import * as React from 'react';
import * as ReactDOM from "react-dom";

document.addEventListener('DOMContentLoaded', () => {
  ReactDOM.render(<MainView />, document.getElementById('root'));
});
