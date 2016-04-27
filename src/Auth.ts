import config from "./config";
import * as querystring from "querystring";
import firebaseRoot from "./firebaseRoot";

async function fetchFirebaseToken() {
  const res = await fetch(`${config.api.root}/firebase_token`, {method: "POST"});
  if (res.status == 201) {
    const json = await res.json();
    return json["token"] as string;
  } else {
    throw new Error("cannot create firebase token");
  }
}

export
async function authFirebase() {
  const token = await fetchFirebaseToken();
  return await firebaseRoot.authWithCustomToken(token);
}

const callbackURL = `${location.origin}${location.pathname}#!/auth_callback`

export
function loginWithGoogle() {
  const url = `${config.api.root}/login?` + querystring.stringify({
    strategy: "google",
    callback_url: callbackURL
  });
  location.href = url;
}
