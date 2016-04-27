require("setimmediate");
require("whatwg-fetch");
require("babel-polyfill");
import MainView from './view/MainView';
import * as page from "page";
import * as APIRequest from "./APIRequest";
import * as qs from "querystring";
import {app} from "./model/App";
import UserFetcher from "./fetcher/UserFetcher";

document.addEventListener('DOMContentLoaded', () => {
  new MainView(document.getElementById("root"));

  page("/auth_callback", async (context) => {
    const token = qs.parse(context.querystring)["token"];
    APIRequest.setAuthToken(token);
    app.user.value =  await UserFetcher.fetchCurrent();
    page.redirect("/");
  });
  page('*', () => {});
  page({
    hashbang: true
  });
});
