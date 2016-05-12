import Vec2 from './Vec2';
import Transform from "./Transform";

export default
class Rect {

  constructor(public min: Vec2, public max: Vec2) {
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

  get bottomLeft() {
    return this.min;
  }
  get bottomRight() {
    return new Vec2(this.max.x, this.min.y);
  }
  get topLeft() {
    return new Vec2(this.min.x, this.max.y);
  }
  get topRight() {
    return this.max;
  }
  get size() {
    return this.max.sub(this.min);
  }
  get center() {
    return this.min.add(this.max).mul(0.5);
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

    const min = new Vec2(Math.min(this.min.x, other.min.x), Math.min(this.min.y, other.min.y));
    const max = new Vec2(Math.max(this.max.x, other.max.x), Math.max(this.max.y, other.max.y));
    return new Rect(min, max);
  }

  intersection(other: Rect) {
    if (this.isEmpty || other.isEmpty) {
      return Rect.empty;
    }
    const min = new Vec2(Math.max(this.min.x, other.min.x), Math.max(this.min.y, other.min.y));
    const max = new Vec2(Math.min(this.max.x, other.max.x), Math.min(this.max.y, other.max.y));
    return new Rect(min, max);
  }

  outset(offset: number) {
    const diff = new Vec2(offset, offset);
    return new Rect(this.min.sub(diff), this.max.add(diff));
  }

  translate(offset: Vec2) {
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

  static fromPoints(p1: Vec2, p2: Vec2) {
    const min = new Vec2(Math.min(p1.x, p2.x), Math.min(p1.y, p2.y));
    const max = new Vec2(Math.max(p1.x, p2.x), Math.max(p1.y, p2.y));
    return new Rect(min, max);
  }

  static fromMetrics(x: number, y: number, width: number, height: number) {
    return new Rect(new Vec2(x, y), new Vec2(x + width, y + height));
  }

  static empty = new Rect(new Vec2(0,0), new Vec2(-1,-1));

  static boundingRect(points: Vec2[]) {
    let rect = Rect.empty;
    for (let i = 1; i < points.length; ++i) {
      rect = rect.union(Rect.fromPoints(points[i - 1], points[i]));
    }
    return rect;
  }
}
