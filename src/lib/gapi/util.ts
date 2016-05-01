
export
function load(apis: string) {
  return new Promise<void>((resolve, reject) => {
    gapi.load(apis, resolve);
  });
}

export
function authorize(clientID: string, {immediate = false}) {
  return new Promise<GoogleApiOAuth2TokenObject>((resolve, reject) => {
    gapi.auth.authorize({
      client_id: clientID,
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
function get<T>(path: string, params: any = {}) {
  const req = gapi.client.request({path, params});
  return new Promise<T>((resolve, reject) => {
    req.then(({result}) => resolve(result), ({body}) => reject(new Error(body)));
  });
}

export
function post<T>(path: string, params: any = {}, body: any = undefined) {
  const req = gapi.client.request({path, params, body});
  return new Promise<T>((resolve, reject) => {
    req.then(({result}) => resolve(result), ({body}) => reject(new Error(body)));
  });
}
