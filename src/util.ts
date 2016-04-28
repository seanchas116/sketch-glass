import * as crypto from "crypto";

export
function md5(text: string) {
  return crypto.createHash('sha1').update(text).digest('base64');
}
