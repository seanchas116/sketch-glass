import Disposable from "./Disposable";

export default
class DisposableBag implements Disposable {
  disposables: Disposable[] = [];

  addDisposable(...disposables: Disposable[]) {
    // FIXME: strictNullChecks fails here
    //this.disposables.push(...disposables);
    this.disposables = this.disposables.concat(disposables);
  }

  dispose() {
    this.disposables.forEach(d => d.dispose());
  }
}
