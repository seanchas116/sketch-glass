import Vec2 from "../lib/geometry/Vec2";
import Rect from "../lib/geometry/Rect";
import Transform from "../lib/geometry/Transform";
import Model from "./Model";

export default
    class Scene {

    size = new Vec2(300, 150);
    devicePixelRatio = 1;
    flip = false;
    transform = Transform.identity;
    models: Iterable<Model> = [];
    region: Rect|undefined;

    constructor(public gl: WebGLRenderingContext) {
    }

    render() {
        const {width, height} = this.size;
        const {gl, transform, devicePixelRatio: dpr} = this;
        let viewportTransform = Transform.scale(new Vec2(2 / width, 2 / height))
            .translate(new Vec2(-1, -1));
        if (this.flip) {
            viewportTransform = viewportTransform.scale(new Vec2(1, -1));
        }
        gl.viewport(0, 0, width * dpr, height * dpr);
        if (this.region) {
            let {min, max} = this.region.transform(transform).boundingIntegerRect().intersection(new Rect(Vec2.zero, this.size));
            min = min.mul(dpr);
            max = max.mul(dpr);
            gl.scissor(min.x, min.y, max.x - min.x, max.y - min.y);
        } else {
            gl.scissor(0, 0, width * dpr, height * dpr);
            gl.clear(gl.COLOR_BUFFER_BIT);
        }

        for (const model of this.models) {
            model.render(viewportTransform, transform);
        }
    }
}
