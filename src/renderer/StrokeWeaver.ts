import Stroke from "../model/Stroke";
import Model from "./Model";
import Vec2 from "../lib/geometry/Vec2";
import TreeDisposable from "../lib/TreeDisposable";

export default
class StrokeWeaver extends TreeDisposable {
  model = new Model(this.gl, []);
  lastSectionLength = 0;

  constructor(public gl: WebGLRenderingContext, public stroke: Stroke) {
    super();
    this.disposables.add(this.model);
  }

  addSegment(last: Vec2, point: Vec2) {
    const {vertices} = this.model;
    const {width} = this.stroke;

    const normal = point.sub(last).normalize().rotate90();
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
    this.lastSectionLength = (vertices.length - 1) * 4;
  }

  rewindLastSection() {
    const {vertices} = this.model;
    const count = this.lastSectionLength;
    vertices.splice(-count, count);
    this.lastSectionLength = 0;
  }
}
