import * as React from "react";
import Disposable from "../Disposable";
import DisposableBag from "../DisposableBag";

export default
class DisposableComponent<TProps, TState> extends React.Component<TProps, TState> {
  disposableBag = new DisposableBag();

  addDisposable(...disposables: Disposable[]) {
    this.disposableBag.addDisposable(...disposables);
  }

  componentWillUnmount() {
    this.disposableBag.dispose();
  }
}
