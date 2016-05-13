
export
    function init() {
    return new Promise((resolve, reject) => {
        window["googleAPILoaded"] = () => {
            resolve();
            delete window["googleAPILoaded"];
        };
        const script = document.createElement("script");
        script.src = "https://apis.google.com/js/client.js?onload=googleAPILoaded";
        document.body.appendChild(script);
    });
}

export
    function load(apis: string) {
    return new Promise((resolve, reject) => {
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
    function request<T>(method: string, path: string, params: any = {}, body: any = undefined) {
    const req = gapi.client.request({ method, path, params, body });
    return new Promise<T>((resolve, reject) => {
        req.then(({result}) => resolve(result), ({body}) => reject(new Error(body)));
    });
}

export
    function get<T>(path: string, params: any = {}) {
    return request<T>("GET", path, params);
}

export
    function post<T>(path: string, params: any = {}, body: any = undefined) {
    return request<T>("POST", path, params, body);
}

export
    function patch<T>(path: string, params: any = {}, body: any = undefined) {
    return request<T>("PATCH", path, params, body);
}
