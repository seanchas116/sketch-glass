import Vec2 from "./Vec2";
import curve3_div from "./curve3_div";

export default
class QuadraticCurve {

    constructor(public start: Vec2, public control: Vec2, public end: Vec2) {
    }

    subdivide() {
        return new curve3_div(this.start, this.control, this.end).points;
    }
}
