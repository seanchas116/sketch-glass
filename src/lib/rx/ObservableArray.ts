import * as Rx from "rx";

interface Splice<T> {
  index: number;
  newValues: T[];
  oldValues: T[];
}

export default
class ObservableArray<T> {
  private _values: T[];
  private _spliced = new Rx.Subject<Splice<T>>();

  get length() {
    return this._values.length;
  }

  get values() {
    return this._values;
  }
  set values(values: T[]) {
    this.remove(0, this.length);
    this.insert(0, values);
  }
  get spliced(): Rx.Observable<Splice<T>> {
    return this._spliced;
  }

  get(index: number) {
    return this._values[index];
  }

  push(value: T) {
    this.insert(this.length, [value]);
  }

  unshift(value: T) {
    this.insert(0, [value]);
  }

  splice(index: number, removeCount: number, ...newValues: T[]) {
    const oldValues = this._values.splice(index, removeCount, ...newValues);
    this._spliced.onNext({index, newValues, oldValues});
  }

  insert(index: number, values: T[]) {
    this.splice(index, 0, ...values);
  }

  remove(index: number, count: number) {
    return this.splice(index, count);
  }

  replace(index: number, newValues: T[]) {
    return this.splice(index, newValues.length, ...newValues);
  }

  set(index: number, value: T) {
    this.replace(index, [value]);
  }

  bindToOther<U>(other: ObservableArray<U>, transform: (value: T) => U): Rx.Disposable {
    other.values = this.values.map(transform);
    return this.spliced.subscribe(({index, newValues, oldValues}) => {
      other.splice(index, oldValues.length, ...newValues.map(transform));
    });
  }

  constructor(values: T[] = []) {
    this._values = values;
  }
}
