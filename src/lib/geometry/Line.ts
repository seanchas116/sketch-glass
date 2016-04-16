import Vec2 from "./Vec2";

export default
class Line {

  // normal vector directs toward left
  get normal() {
    return new Vec2(this.a, this.b);
  }
  get direction() {
    return this.normal.rotate270();
  }

  // ax + by = c
  constructor(public a: number, public b: number, public c: number) {
  }

  intersection(other: Line, fallback?: Vec2 | null) {
    const a1 = this.a;
    const b1 = this.b;
    const c1 = this.c;
    const a2 = other.a;
    const b2 = other.b;
    const c2 = other.c;

    const det = a1 * b2 - b1 * a2;
    if (det === 0) {
      if (fallback != null) {
        return fallback;
      } else {
        console.warn(`no intersection point for ${this} and ${other}`);
        return new Vec2(0, 0);
      }
    }

    return new Vec2(
      b2 * c1 - b1 * c2,
      a1 * c2 - a2 * c1
    ).div(det);
  }

  // left: > 0
  // on line: = 0
  // right: < 0
  signedDistance(p: Vec2) {
    return this.normal.dot(p) - this.c;
  }

  bisector(other: Line, fallback?: Line | null) {
    const i = this.intersection(other, null);
    if (!i) {
      if (fallback != null) {
        return fallback;
      } else {
        console.warn(`no bisector line for ${this} and ${other}`);
        return new Line(1, 0, 0);
      }
    }
    const n = this.normal.add(other.normal).normalize();
    const d = n.dot(i);
    return new Line(n.x, n.y, d);
  }

  // translate to left
  translate(d: number) {
    return new Line(this.a, this.b, this.c + d);
  }

  toString() {
    return `Line(${this.a}x + ${this.b}y = ${this.c})`;
  }

  static fromPointAndNormal(p: Vec2, n: Vec2) {
    return new Line(n.x, n.y, n.dot(p));
  }

  static fromTwoPoints(p1: Vec2, p2: Vec2) {
    const n = p2.sub(p1).normalize().rotate90();
    return this.fromPointAndNormal(p1, n);
  }
}
