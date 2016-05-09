import {CompositeDisposable, SerialDisposable, Disposable, Observable, IObserver} from "rx";

export default
class ObservableDestination implements Disposable {
  disposables = new CompositeDisposable();
  isDisposed = false;

  dispose() {
    this.disposables.dispose();
    this.isDisposed = true;
  }

  subscribe<T>(observable: Observable<T>, observer: IObserver<T> | ((value: T) => void)) {
    if (observer instanceof Function) {
      this.disposables.add(observable.subscribe(observer, (error) => {
        console.error(error);
      }));
    } else {
      this.disposables.add(observable.subscribe(observer));
    }
  }

  subscribeWithDestination<T>(observable: Observable<T>, action: (value: T, destination: ObservableDestination) => void) {
    const holder = new SerialDisposable();
    this.disposables.add(holder);
    this.disposables.add(
      observable.forEach(value => {
        const destination = new ObservableDestination();
        action(value, destination);
        holder.setDisposable(destination);
      })
    );
  }

  subscribeArrayWithTracking<TOriginal, TValue extends Disposable>(
    observable: Rx.Observable<TOriginal[]>,
    getKey: (original: TOriginal) => any, create: (original: TOriginal) => TValue, update: (value: TValue, original: TOriginal) => void,
    observer: Rx.IObserver<TValue[]>
  ) {
    let valueMap: Map<any, TValue>|undefined;
    const subscription = observable.subscribe(originals => {
      if (valueMap == undefined) {
        valueMap = new Map(originals.map(d => [getKey(d), create(d)] as [any, TValue]));
        observer.onNext(Array.from(valueMap!.values()));
      } else {
        const values: TValue[] = [];
        const unusedKeys = new Set(valueMap.keys());
        for (const original of originals) {
          const key = getKey(original);
          const instance = valueMap.get(key);
          if (instance != undefined) {
            update(instance, original);
            values.push(instance);
            unusedKeys.delete(key);
          } else {
            values.push(create(original));
          }
        }
        for (const key of unusedKeys) {
          const value = valueMap.get(key);
          if (value != undefined) {
            value.dispose();
          }
          valueMap.delete(key);
        }
        observer.onNext(values);
      }
    });
    this.disposables.add(subscription);
  }
}
