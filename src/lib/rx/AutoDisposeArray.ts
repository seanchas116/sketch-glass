import ObservableArray from "./ObservableArray";
import Disposable from "../Disposable";

export default
class AutoDisposeArray<T extends Disposable> extends ObservableArray<T> implements Disposable {

  constructor(values: T[] = []) {
    super(values);
    this.removed.subscribe(({index, values}) => {
      values.forEach(v => v.dispose());
    });
    this.replaced.subscribe(({index, newValues, oldValues}) => {
      oldValues.forEach(v => v.dispose());
    });
  }

  dispose() {
    this.values = [];
  }
}
