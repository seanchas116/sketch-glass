import DisposableBag from "./DisposableBag";

export default
class TreeDisposable {
  disposables = new DisposableBag();

  dispose() {
    this.disposables.dispose();
  }
}
