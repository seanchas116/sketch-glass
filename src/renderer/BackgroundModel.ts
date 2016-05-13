import Transform from "../lib/geometry/Transform";
import Vec2 from "../lib/geometry/Vec2";
import Model from "./Model";
import Shader from "./Shader";
import Polygon from "./Polygon";

export default
    class BackgroundModel implements Model {
    polygon = new Polygon(this.gl, [
        [new Vec2(-1, -1), new Vec2(0, 0)],
        [new Vec2(-1, 1), new Vec2(0, 0)],
        [new Vec2(1, -1), new Vec2(0, 0)],
        [new Vec2(1, 1), new Vec2(0, 0)],
    ]);

    constructor(public gl: WebGLRenderingContext, public shader: Shader) {
        this.polygon.updateBuffer();
    }

    render(viewportTransform: Transform, sceneTransform: Transform) {
        this.shader.use();
        this.polygon.draw(this.shader);
    }
}
