import Transform from "../lib/geometry/Transform";
import Vec2 from "../lib/geometry/Vec2";
import Model from "./Model";
import Shader from "./Shader";
import Polygon from "./Polygon";
import Color from "../lib/geometry/Color";

export default
class BackgroundModel implements Model {
    polygon = new Polygon(this.gl, this.shader, [
        [new Vec2(-1000, -1000), 0],
        [new Vec2(-1000, 1000), 0],
        [new Vec2(1000, -1000), 0],
        [new Vec2(1000, 1000), 0],
    ]);

    constructor(public gl: WebGLRenderingContext, public shader: Shader) {
        this.polygon.updateBuffer(false);
    }

    render(viewportTransform: Transform, sceneTransform: Transform) {
        this.shader.transform = Transform.identity;
        this.shader.color = Color.white;
        this.polygon.draw();
    }
}
