import * as Rx from "rx";

export default
class Variable<T> {
  private _value: T;
  private _subject: Rx.BehaviorSubject<T>;

  get value() {
    return this._value;
  }
  set value(newValue: T) {
    if (this._value != newValue) {
      this._value = newValue;
      this._subject.onNext(newValue);
    }
  }

  get changed() {
    return this._subject;
  }

  constructor(value: T) {
    this._value = value;
    this._subject = new Rx.BehaviorSubject(value);
  }
}
