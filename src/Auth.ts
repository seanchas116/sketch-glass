import config from "./config";
import Variable from "./lib/rx/Variable";
import * as GoogleAPI from "./lib/GoogleAPI";

export
let accessToken: string;

export
const isAuthenticated = new Variable(false);

export
async function check() {
  try {
    const result = await GoogleAPI.authorize(config.google.clientID, {immediate: true});
    accessToken = result.access_token;
    isAuthenticated.value = true;
  } catch (error) {
    console.log("need to relogin", error);
  }
}

export
async function popup() {
  const result = await GoogleAPI.authorize(config.google.clientID, {immediate: true});
  accessToken = result.access_token;
  isAuthenticated.value = true;
}
