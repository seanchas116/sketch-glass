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
}
