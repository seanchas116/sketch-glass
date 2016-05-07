import ObservableArray from "./ObservableArray";
import {Disposable} from "rx";

export default
class AutoDisposeArray<T extends Disposable> extends ObservableArray<T> implements Disposable {

  isDisposed = false;

  constructor(values: T[] = []) {
    super(values);
    this.spliced.subscribe(({index, newValues, oldValues}) => {
      oldValues.forEach(v => v.dispose());
    });
  }

  dispose() {
    this.values = [];
    this.isDisposed = true;
  }
}
