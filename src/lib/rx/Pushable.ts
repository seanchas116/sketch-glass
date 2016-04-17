import * as Rx from "rx";
import Variable from "./Variable";

export default
class Pushable<T> extends Variable<T[]> {
  private _pushed = new Rx.Subject<T>();

  get pushed(): Rx.Observable<T> {
    return this._pushed;
  }

  push(item: T) {
    this.value.push(item);
    this._pushed.onNext(item);
  }
}
