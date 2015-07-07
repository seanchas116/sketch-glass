import Color from "../common/color";

export default
class Background {

  constructor(public color: Color) {
  }

  get isOpaque() {
    return this.color.a !== 0;
  }
}
