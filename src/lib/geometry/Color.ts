export default
class Color {

  constructor(public r: number, public g: number, public b: number, public a: number) {
  }

  toString() {
    return `rgba(${this.r}, ${this.g}, ${this.b}, ${this.a})`;
  }

  toData() {
    return new Float32Array([this.r, this.g, this.b, this.a]);
  }

  static black = new Color(0,0,0,1);
  static white = new Color(255,255,255,1);
  static transparent = new Color(0,0,0,0);
}
