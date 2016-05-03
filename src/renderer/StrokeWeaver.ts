import Stroke from "../model/Stroke";
import Model from "./Model";
import Vec2 from "../lib/geometry/Vec2";
import Curve from "../lib/geometry/Curve";
import TreeDisposable from "../lib/TreeDisposable";
import StrokeCollider from "./StrokeCollider";

export default
class StrokeWeaver extends TreeDisposable {
  model = new Model(this.gl, []);
  lastSectionLength = 0;
  collider: StrokeCollider;
  vertices: Vec2[] = [];
  points: Vec2[] = [];

  constructor(public gl: WebGLRenderingContext, public stroke: Stroke) {
    super();
    this.disposables.add(this.model);
    for (const pos of stroke.points) {
      this.drawPoint(pos);
    }
    this.model.updateBuffer();
  }

  addPoint(pos: Vec2) {
    this.stroke.points.push(pos);
    this.drawPoint(pos);
    this.model.updateBuffer();
  }

  drawPoint(pos: Vec2) {
    const {points} = this;
    points.push(pos);
    const nPoints = points.length;

    if (nPoints === 2) {
      this.drawSection(points);
    } else if (nPoints === 3) {
      this.rewindLastSection();
      this.drawSection(Curve.bSpline(points[0], points[0], points[1], points[2]).subdivide());
      this.drawSection(Curve.bSpline(points[0], points[1], points[2], points[2]).subdivide());
    } else if (nPoints > 3) {
      this.rewindLastSection();
      this.drawSection(Curve.bSpline(points[nPoints - 4], points[nPoints - 3], points[nPoints - 2], points[nPoints - 1]).subdivide());
      this.drawSection(Curve.bSpline(points[nPoints - 3], points[nPoints - 2], points[nPoints - 1], points[nPoints - 1]).subdivide());
    } else {
      return;
    }
  }

  finalize() {
    this.collider = new StrokeCollider(this.stroke.width, this.vertices);
  }

  drawSegment(last: Vec2, point: Vec2) {
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

  drawSection(vertices: Vec2[]) {
    for (let i = 0; i < vertices.length - 1; ++i) {
      this.drawSegment(vertices[i], vertices[i+1]);
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
}
