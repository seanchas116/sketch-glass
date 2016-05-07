import Component from "./Component";
import ObservableArray from "../rx/ObservableArray";

export default
class ListView<T> extends Component {
  static template = `
    <div class="sg-list-view">
    </div>
  `;

  constructor(
    mountPoint: Element,
    public array: ObservableArray<T>,
    public factory: (value: T) => Component
  ) {
    super(mountPoint);

    this._insert(0, array.values);

    this.subscribe(array.inserted, ({index, values}) => {
      this._insert(index, values);
    });
    this.subscribe(array.removed, ({index, values}) => {
      this._remove(index, values.length);
    });
    this.subscribe(array.replaced, ({index, newValues, oldValues}) => {
      this._remove(index, oldValues.length);
      this._insert(index, newValues);
    });
  }

  private _insert(index: number, values: T[]) {
    const {element, factory} = this;
    const before = element.childNodes[index];
    for (const value of values) {
      const newElem = factory(value).element;
      element.insertBefore(newElem, before);
    }
  }

  private _remove(index: number, count: number) {
    const {element} = this;
    for (let i = 0; i < count; ++i) {
      element.removeChild(element.childNodes[index]);
    }
  }
}
