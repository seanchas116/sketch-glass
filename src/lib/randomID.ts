import * as crypto from "crypto";
const base64url = require("base64url");

// generates a random ID based on base64url
export default
function randomID(): string {
  return base64url(crypto.randomBytes(15));
}
