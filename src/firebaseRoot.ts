import * as Firebase from "firebase";
import config from "./config";

const ref = new Firebase(config.firebase.root);
export default ref;
