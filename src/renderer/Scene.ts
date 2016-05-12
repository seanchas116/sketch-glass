import Vec2 from "../lib/geometry/Vec2";
import Transform from "../lib/geometry/Transform";
import Model from "./Model";

export default
class Scene {

  size = new Vec2(300, 150);
  devicePixelRatio = 1;
  flip = false;
  transform = Transform.identity();
  models: Iterable<Model> = [];

  constructor(public gl: WebGLRenderingContext) {
  }

  render() {
    const {width, height} = this.size;
    const {gl, transform, devicePixelRatio} = this;
    let viewportTransform =  Transform.scale(new Vec2(2 / width, 2 / height))
      .translate(new Vec2(-1, -1));
    if (this.flip) {
      viewportTransform = viewportTransform.scale(new Vec2(1, -1));
    }
    gl.viewport(0, 0, width * devicePixelRatio, height * devicePixelRatio);
    gl.clear(gl.COLOR_BUFFER_BIT);

    for (const model of this.models) {
      model.render(viewportTransform, transform);
    }
  }
}
