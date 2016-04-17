import * as crypto from "crypto";

// generates a random ID that can be used as Firebase key
export default
function randomID() {
  return crypto.randomBytes(15).toString("base64").replace("/", "-");
}
