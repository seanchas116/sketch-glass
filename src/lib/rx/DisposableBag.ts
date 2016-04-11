import * as Rx from "rx";

export default
class DisposableBag implements Rx.IDisposable {
  disposables: Rx.IDisposable[] = [];

  addDisposable(...disposables: Rx.IDisposable[]) {
    // FIXME: strictNullChecks fails here
    //this.disposables.push(...disposables);
    this.disposables = this.disposables.concat(disposables);
  }

  dispose() {
    this.disposables.forEach(d => d.dispose());
  }
}
