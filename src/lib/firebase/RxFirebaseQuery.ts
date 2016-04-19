import * as Firebase from "firebase";
import * as Rx from "rx";

export default
class RxFirebaseQuery {
  constructor(public query: FirebaseQuery) {
  }

  on(event: string): Rx.Observable<Firebase.DataSnapshot> {
    return Rx.Observable.create(observer => {
      this.query.on(event, (value) => {
        observer.onNext(value)
      }, (err) => {
        observer.onError(err)
      });
      return () => {
        this.query.off(event);
      };
    });
  }
}
