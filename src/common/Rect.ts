import Point from './Point';
import Transform from "./Transform";

export default
class Rect {

  constructor(public min: Point, public max: Point) {
  }

  get x() {
    return this.min.x;
  }
  get y() {
    return this.min.y;
  }

  get width() {
    return this.max.x - this.min.x;
  }
  get height() {
    return this.max.y - this.min.y;
  }

  get isEmpty() {
    return this.max.x < this.min.x || this.max.y < this.min.y;
  }

  union(other: Rect) {
    if (this.isEmpty) {
      return other;
    }
    if (other.isEmpty) {
      return this;
    }

    const min = new Point(Math.min(this.min.x, other.min.x), Math.min(this.min.y, other.min.y));
    const max = new Point(Math.max(this.max.x, other.max.x), Math.max(this.max.y, other.max.y));
    return new Rect(min, max);
  }

  intersection(other: Rect) {
    if (this.isEmpty || other.isEmpty) {
      return Rect.empty;
    }
    const min = new Point(Math.max(this.min.x, other.min.x), Math.max(this.min.y, other.min.y));
    const max = new Point(Math.min(this.max.x, other.max.x), Math.min(this.max.y, other.max.y));
    return new Rect(min, max);
  }

  outset(offset: number) {
    const diff = new Point(offset, offset);
    return new Rect(this.min.sub(diff), this.max.add(diff));
  }

  translate(offset: Point) {
    return new Rect(this.min.add(offset), this.max.add(offset));
  }

  transform(transform: Transform) {
    const p1 = this.min.transform(transform);
    const p2 = this.max.transform(transform);

    return Rect.fromPoints(p1, p2);
  }

  boundingIntegerRect() {
    return new Rect(this.min.floor(), this.max.ceil());
  }

  toString() {
    return `Rect(${this.min},${this.max})`
  }

  equals(other: Rect) {
    return this.min.equals(other.min) && this.max.equals(other.max);
  }

  static fromPoints(p1: Point, p2: Point) {
    const min = new Point(Math.min(p1.x, p2.x), Math.min(p1.y, p2.y));
    const max = new Point(Math.max(p1.x, p2.x), Math.max(p1.y, p2.y));
    return new Rect(min, max);
  }

  static fromMetrics(x: number, y: number, width: number, height: number) {
    return new Rect(new Point(x, y), new Point(x + width, y + height));
  }

  static get empty() {
    return new Rect(new Point(0,0), new Point(-1,-1));
  }
}
