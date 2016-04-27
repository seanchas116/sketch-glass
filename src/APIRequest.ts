import config from "./config";
const deepAssign = require('deep-assign');

export
let authToken = "";

export
function setAuthToken(token: string) {
  console.log(`Setting auth token to ${token}`);
  authToken = token;
}

export
async function request<T>(path: string, options: Object = {}) {
  const opts = {
    headers: {
      'Authorization': `Bearer ${authToken}`
    }
  };
  deepAssign(opts, options);

  const response = await fetch(`${config.api.root}${path}`, opts);
  if (response.status == 200) {
    return await response.json<T>();
  } else {
    throw new Error("request failed");
  }
}
