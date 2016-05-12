import Vec2 from "../lib/geometry/Vec2";
import Transform from "../lib/geometry/Transform";
import Model from "./Model";

export default
class Scene {

  size = new Vec2(300, 150);
  devicePixelRatio = 1;
  transform = Transform.identity();
  models: Iterable<Model> = [];

  constructor(public gl: WebGLRenderingContext) {
  }

  render() {
    const {width, height} = this.size;
    const {gl, transform, devicePixelRatio} = this;
    const viewportTransform =  Transform.scale(new Vec2(2 / width, 2 / height))
      .translate(new Vec2(-1, -1))
      .scale(new Vec2(1, -1));
    gl.viewport(0, 0, width * devicePixelRatio, height * devicePixelRatio);

    for (const model of this.models) {
      model.render(viewportTransform, transform);
    }
  }
}
