import Transform from "../lib/geometry/Transform";
import Vec2 from "../lib/geometry/Vec2";
import Model from "./Model";
import Shader from "./Shader";
import Polygon from "./Polygon";

export default
    class BackgroundModel implements Model {
    polygon = new Polygon(this.gl, this.shader, [
        [new Vec2(-1, -1), 0],
        [new Vec2(-1, 1), 0],
        [new Vec2(1, -1), 0],
        [new Vec2(1, 1), 0],
    ]);

    constructor(public gl: WebGLRenderingContext, public shader: Shader) {
        this.polygon.updateBuffer();
    }

    render(viewportTransform: Transform, sceneTransform: Transform) {
        this.polygon.draw();
    }
}
