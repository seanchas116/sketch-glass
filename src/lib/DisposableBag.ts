import Disposable from "./Disposable";

export default
class DisposableBag implements Disposable {
  disposables = new Set<Disposable>();

  addDisposable(...disposables: Disposable[]) {
    for (const d of disposables) {
      this.disposables.add(d);
    }
  }

  dispose() {
    for (const d of this.disposables) {
      d.dispose();
    }
  }
}
