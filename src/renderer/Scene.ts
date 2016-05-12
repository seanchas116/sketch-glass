import Vec2 from "../lib/geometry/Vec2";
import Transform from "../lib/geometry/Transform";
import Model from "./Model";

export default
class Scene {

  private _size: Vec2;
  private _viewportTransform: Transform;
  transform: Transform;
  models: Iterable<Model> = [];

  get size() {
    return this._size;
  }
  set size(size: Vec2) {
    const {width, height} = this._size = size;
    this._viewportTransform = Transform.scale(new Vec2(2 / width, 2 / height))
      .translate(new Vec2(-1, -1))
      .scale(new Vec2(1, -1));
  }

  constructor(public gl: WebGLRenderingContext) {
    this.size = new Vec2(300, 150);
  }

  render() {
    const {_viewportTransform: vpTransform, transform} = this;

    for (const model of this.models) {
      model.render(vpTransform, transform);
    }
  }
}
