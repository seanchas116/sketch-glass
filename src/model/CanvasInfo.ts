import * as Firebase from "firebase";
import Variable from "../lib/rx/Variable";
import firebaseRoot from "../firebaseRoot";
import randomID from "../lib/randomID";

class CanvasInfo {
  id: string;
  name = new Variable("New Canvas");
  updatedAt = new Variable(new Date());
  ref: Firebase;

  constructor(id: string | null) {
    this.ref = firebaseRoot.child(`canvases/${id}`);
    if (id != null) {
      this.id = id;
    } else {
      this.id = randomID();
      this.ref.set({
        name: this.name.value,
        updatedAt: Firebase.ServerValue.TIMESTAMP
      });
    }
    this.ref.on("value", (snap) => {
      const val = snap.val();
      this.name.value = val.name;
      this.updatedAt.value = new Date(val.updatedAt);
    });
  }

  save() {
    this.ref.update({
      name: this.name.value,
      updatedAt: Firebase.ServerValue.TIMESTAMP
    });
  }
}
