import Variable from "./Variable";

export default
class AutoDisposeVariable<T extends Rx.Disposable> extends Variable<T|undefined> {
    set value(newValue: T|undefined) {
        if (this.value != newValue) {
            this.dispose();
        }
        super.value = newValue;
    }

    constructor(value: T|undefined) {
        super(value);
    }

    dispose() {
        if (this.value != undefined) {
            this.value.dispose();
        }
    }
}
