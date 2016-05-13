import config from "./config";
import Variable from "./lib/rx/Variable";
import * as GoogleAPI from "./lib/GoogleAPI";

export
    let accessToken = "";

function wait(ms: number) {
    return new Promise(resolve => {
        setTimeout(resolve, ms);
    });
}

async function refetchToken(expiresIn: number) {
    await wait(expiresIn * 0.75 * 1000);
    while (true) {
        if (check()) {
            break;
        }
        await wait(60 * 1000);
    }
}

export
    async function check() {
    try {
        const result = await GoogleAPI.authorize(config.google.clientID, { immediate: true });
        accessToken = result.access_token;
        refetchToken(parseInt(result.expires_in));
        return true;
    } catch (error) {
        return false;
    }
}

export
    async function popup() {
    const result = await GoogleAPI.authorize(config.google.clientID, { immediate: false });
    accessToken = result.access_token;
}
