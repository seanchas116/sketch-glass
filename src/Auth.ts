import config from "./config";
import Variable from "./lib/rx/Variable";
import * as gapiUtil from "./lib/gapi/util";

export
let accessToken: string;

export
const isAuthenticated = new Variable(false);

export
async function check() {
  try {
    const result = await gapiUtil.authorize(config.google.clientID, {immediate: true});
    accessToken = result.access_token;
    isAuthenticated.value = true;
  } catch (error) {
    console.log("need to relogin", error);
  }
}

export
async function popup() {
  const result = await gapiUtil.authorize(config.google.clientID, {immediate: true});
  accessToken = result.access_token;
  isAuthenticated.value = true;
}
