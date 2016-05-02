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

    this.disposables.add(
      array.inserted.subscribe(({index, values}) => {
        this._insert(index, values);
      }),
      array.removed.subscribe(({index, values}) => {
        this._remove(index, values.length);
      }),
      array.replaced.subscribe(({index, newValues, oldValues}) => {
        this._remove(index, oldValues.length);
        this._insert(index, newValues);
      })
    );
  }

  private _insert(index: number, values: T[]) {
    const {element, factory} = this;
    const before = element.childNodes[index];
    for (const value of values) {
      const elem = factory(value).element;
      element.insertBefore(element, before);
    }
  }

  private _remove(index: number, count: number) {
    const {element} = this;
    for (let i = 0; i < count; ++i) {
      element.removeChild(element.childNodes[index]);
    }
  }
}
