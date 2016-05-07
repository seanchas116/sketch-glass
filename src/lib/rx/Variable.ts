import * as Rx from "rx";

export default
class Variable<T> implements Rx.IObserver<T> {
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

  get changed(): Rx.Observable<T> {
    return this._subject;
  }

  constructor(value: T) {
    this._value = value;
    this._subject = new Rx.BehaviorSubject(value);
  }

  onNext(value: T) {
    this.value = value;
  }

  onError(exception: any) {
    console.error(exception);
  }

  onCompleted() {
  }
}
