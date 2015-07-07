import Color from "../common/color";

export default
class Background {
  color: Color;

  constructor(color: Color) {
    this.color = color;
  }

  get isOpaque() {
    return this.color.a !== 0;
  }
}
