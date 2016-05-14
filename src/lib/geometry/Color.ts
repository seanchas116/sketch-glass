const tinycolor = require("tinycolor2");

export default
    class Color {

    constructor(public r: number, public g: number, public b: number, public a: number) {
    }

    equals(other: Color) {
        return this.r == other.r && this.g == other.g && this.b == other.b && this.a == other.a;
    }

    toString() {
        return `rgba(${this.r}, ${this.g}, ${this.b}, ${this.a})`;
    }

    toData() {
        return new Float32Array([this.r, this.g, this.b, this.a]);
    }

    static black = new Color(0, 0, 0, 1);
    static white = new Color(255, 255, 255, 1);
    static transparent = new Color(0, 0, 0, 0);

    static fromTinycolor(color: any) {
        const {r, g, b, a} = color.toRgb();
        return new Color(r, g, b, a);
    }

    static fromString(str: string) {
        return this.fromTinycolor(tinycolor(str));
    }

    static fromHSV(h: number, s: number, v: number) {
        return this.fromTinycolor(tinycolor({ h, s, v }));
    }
}
