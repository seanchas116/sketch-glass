import * as Firebase from "firebase";
import * as Rx from "rx";
import RxFirebaseQuery from "./RxFirebaseQuery";

export default
class RxFirebase extends RxFirebaseQuery {
  constructor(public ref: Firebase) {
    super(ref);
  }
}
