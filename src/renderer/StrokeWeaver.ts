import Stroke from "../model/Stroke";
import Model from "./Model";
import Vec2 from "../lib/geometry/Vec2";
import TreeDisposable from "../lib/TreeDisposable";
import StrokeCollider from "./StrokeCollider";

export default
class StrokeWeaver extends TreeDisposable {
  model = new Model(this.gl, []);
  lastSectionLength = 0;
  collider: StrokeCollider;
  vertices: Vec2[] = [];

  constructor(public gl: WebGLRenderingContext, public stroke: Stroke) {
    super();
    this.disposables.add(this.model);
  }

  addSegment(last: Vec2, point: Vec2) {
    const {vertices} = this.model;
    const {width} = this.stroke;

    const normal = point.sub(last).normal();
    const toLeft = normal.mul(width / 2);
    const toRight = normal.mul(-width / 2);
    vertices.push([last.add(toLeft), new Vec2(-1, 0)]);
    vertices.push([last.add(toRight), new Vec2(1, 0)]);
    vertices.push([point.add(toLeft), new Vec2(-1, 0)]);
    vertices.push([point.add(toRight), new Vec2(1, 0)]);
  }

  addSection(vertices: Vec2[]) {
    for (let i = 0; i < vertices.length - 1; ++i) {
      this.addSegment(vertices[i], vertices[i+1]);
    }
    this.vertices.pop();
    this.vertices.push(...vertices);
    this.lastSectionLength = vertices.length - 1;
  }

  rewindLastSection() {
    const count = this.lastSectionLength;
    this.model.vertices.splice(-count * 4, count * 4);
    this.vertices.splice(-count, count);
    this.lastSectionLength = 0;
  }

  finalize() {
    this.collider = new StrokeCollider(this.stroke.width, this.vertices);
  }
}
