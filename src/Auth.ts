import config from "./config";
import Variable from "./lib/rx/Variable";

export
let accessToken: string;

export
const isAuthenticated = new Variable(false);

function authenticate({immediate = false}) {
  return new Promise<GoogleApiOAuth2TokenObject>((resolve, reject) => {
    gapi.auth.authorize({
      client_id: config.google.clientID,
      scope: "https://www.googleapis.com/auth/drive.file",
      immediate
    }, (authResult) => {
      if (authResult.error) {
        reject(new Error(authResult.error));
      } else {
        resolve(authResult);
      }
    });
  });
}

export
async function check() {
  try {
    const result = await authenticate({immediate: true});
    accessToken = result.access_token;
    isAuthenticated.value = true;
  } catch (error) {
    console.log("need to relogin", error);
  }
}

export
async function popup() {
  const result = await authenticate({immediate: false});
  accessToken = result.access_token;
  isAuthenticated.value = true;
}
