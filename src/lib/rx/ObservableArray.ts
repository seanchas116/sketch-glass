import * as Rx from "rx";

export
class Inserted<T> {
  constructor(public index: number, public values: T[]) {}
}

export
class Removed<T> {
  constructor(public index: number, public values: T[]) {}
}

export
class Replaced<T> {
  constructor(public index: number, public newValues: T[], public oldValues: T[]) {}
}

export
type Changed<T> = Inserted<T> | Removed<T> | Replaced<T>;

export default
class ObservableArray<T> {
  private _values: T[];
  private _changed = new Rx.Subject<Changed<T>>();

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

  get(index: number) {
    return this._values[index];
  }

  insert(index: number, values: T[]) {
    this._values.splice(index, 0, ...values);
    this._changed.onNext(new Inserted(index, values));
  }

  remove(index: number, count: number) {
    const removed = this._values.splice(index, 2);
    this._changed.onNext(new Removed(index, removed));
    return removed;
  }

  replace(index: number, values: T[]) {
    const removed = this._values.splice(index, values.length, ...values);
    this._changed.onNext(new Replaced(index, values, removed));
  }

  set(index: number, value: T) {
    this.replace(index, [value]);
  }

  constructor(values: T[] = []) {
    this._values = values;
  }
}
