import config from "./config";
import * as qs from "querystring";
import firebaseRoot from "./firebaseRoot";
import * as APIRequest from "./APIRequest";
import UserFetcher from "./fetcher/UserFetcher";
import {app} from "./model/App";

async function fetchFirebaseToken() {
  const json = await APIRequest.request(`/firebase_tokens`, {method: "POST"});
  return json["token"] as string;
}

async function authFirebase() {
  const token = await fetchFirebaseToken();
  return await firebaseRoot.authWithCustomToken(token);
}

const callbackURL = `${location.origin}${location.pathname}`;

export
async function authWithCallbackParams() {
  const hash = location.hash;
  if (hash.length > 1) {
    const params = qs.parse(hash.slice(1));
    const token = params["access_token"];
    APIRequest.setAuthToken(token);
    let [_, user] = await Promise.all([await authFirebase(), await UserFetcher.fetchCurrent()]);
    app.user.value = user;
    await authFirebase();
    return true;
  }
  return false;
}

export
function loginWithGoogle() {
  const url = `${config.api.root}/oauth/authorize?` + qs.stringify({
    response_type: "token",
    client_id: config.api.applicationID,
    state: "", // TODO: use state
    redirect_uri: callbackURL,
    login_with: "google_oauth2"
  });
  location.href = url;
}
