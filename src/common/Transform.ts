import Point from './Point';

export default
class Transform {

  constructor(public m11: number, public m12: number, public m21: number, public m22: number, public dx: number, public dy: number) {
  }

  merge(other: Transform) {
    // other * this
    // [P u] [Q v]   [PQ Pv + u]
    // [0 1] [0 1] = [0  1     ]
    const m11 = other.m11 * this.m11 + other.m21 * this.m12;
    const m21 = other.m11 * this.m21 + other.m21 * this.m22;
    const m12 = other.m12 * this.m11 + other.m22 * this.m12;
    const m22 = other.m12 * this.m21 + other.m22 * this.m22;
    const dx = other.m11 * this.dx + other.m21 * this.dy + other.dx;
    const dy = other.m12 * this.dx + other.m22 * this.dy + other.dy;
    return new Transform(m11, m12, m21, m22, dx, dy);
  }

  invert() {
    // [P u]^-1   [P^-1 -P^1 * v]
    // [0 1]    = [0    1       ]
    const det = this.m11 * this.m22 - this.m12 * this.m21;
    const m11 = this.m22 / det;
    const m12 = -this.m12 / det;
    const m21 = -this.m21 / det;
    const m22 = this.m11 / det;
    const dx = -(m11 * this.dx + m21 * this.dy);
    const dy = -(m12 * this.dx + m22 * this.dy);
    return new Transform(m11, m12, m21, m22, dx, dy);
  }

  translate(delta: Point) {
    return new Transform(
      this.m11, this.m12, this.m21, this.m22,
      this.dx + delta.x, this.dy + delta.y);
  }

  scale(scaleX: number, scaleY: number) {
    return new Transform(
      this.m11 * scaleX, this.m12 * scaleX, this.m21 * scaleY, this.m22 * scaleY,
      this.dx * scaleX, this.dy * scaleY);
  }

  toData() {
    return new Float32Array([this.m11, this.m12, 0, this.m21, this.m22, 0, this.dx, this.dy, 1]);
  }

  toString() {
    return `Transform([${this.m11},${this.m12}],[${this.m21},${this.m22}],[${this.dx},${this.dy}])`;
  }

  static identity() {
    return new Transform(1, 0, 0, 1, 0, 0);
  }

  static scale(scaleX: number, scaleY: number) {
    return new Transform(scaleX, 0, 0, scaleY, 0, 0);
  }

  static translation(translation: Point) {
    return new Transform(1, 0, 0, 1, translation.x, translation.y);
  }

  static fromPoints(s1: Point, s2: Point, s3: Point, d1: Point, d2: Point, d3: Point) {
    const s1s2 = s2.sub(s1);
    const s1s3 = s3.sub(s1);
    const d1d2 = d2.sub(d1);
    const d1d3 = d3.sub(d1);

    const result = Transform.translation(s1.negate())
      .merge(new Transform(s1s2.x, s1s2.y, s1s3.x, s1s3.y, 0, 0).invert())
      .merge(new Transform(d1d2.x, d1d2.y, d1d3.x, d1d3.y, 0, 0))
      .merge(Transform.translation(d1));

    return result;
  }
}
