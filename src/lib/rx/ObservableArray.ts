import * as Rx from "rx";

interface Inserted<T> {
  index: number;
  values: T[];
}

interface Removed<T> {
  index: number;
  values: T[];
}

interface Replaced<T> {
  index: number;
  newValues: T[];
  oldValues: T[];
}

export default
class ObservableArray<T> {
  private _values: T[];
  private _inserted = new Rx.Subject<Inserted<T>>();
  private _removed = new Rx.Subject<Removed<T>>();
  private _replaced = new Rx.Subject<Replaced<T>>();

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
  get inserted(): Rx.Observable<Inserted<T>> {
    return this._inserted;
  }
  get removed(): Rx.Observable<Removed<T>> {
    return this._removed;
  }
  get replaced(): Rx.Observable<Replaced<T>> {
    return this._replaced;
  }

  get(index: number) {
    return this._values[index];
  }

  push(value: T) {
    this.insert(this.length, [value]);
  }

  insert(index: number, values: T[]) {
    this._values.splice(index, 0, ...values);
    this._inserted.onNext({index, values});
  }

  remove(index: number, count: number) {
    const values = this._values.splice(index, 2);
    this._removed.onNext({index, values});
    return values;
  }

  replace(index: number, newValues: T[]) {
    const oldValues = this._values.splice(index, newValues.length, ...newValues);
    this._replaced.onNext({index, newValues, oldValues});
  }

  set(index: number, value: T) {
    this.replace(index, [value]);
  }

  constructor(values: T[] = []) {
    this._values = values;
  }
}
