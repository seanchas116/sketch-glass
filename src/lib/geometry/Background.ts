import Color from "./Color";

export default
    class Background {

    constructor(public color: Color) {
    }

    get isOpaque() {
        return this.color.a !== 0;
    }
}
