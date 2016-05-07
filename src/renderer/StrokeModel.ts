import Stroke from "../model/Stroke";
import Polygon from "./Polygon";
import Vec2 from "../lib/geometry/Vec2";
import Curve from "../lib/geometry/Curve";
import StrokeCollider from "./StrokeCollider";
import StrokeShader from "./StrokeShader";
import Model from "./Model";
import Transform from "../lib/geometry/Transform";

export default
class StrokeModel implements Model {
  polygon = new Polygon(this.gl, []);
  lastSectionLength = 0;
  collider: StrokeCollider;
  vertices: Vec2[] = [];
  points: Vec2[] = [];

  constructor(public gl: WebGLRenderingContext, public shader: StrokeShader, public stroke: Stroke) {
    for (const pos of stroke.points) {
      this.drawPoint(pos);
    }
    this.polygon.updateBuffer();
  }

  dispose() {
    this.polygon.dispose();
  }

  addPoint(pos: Vec2) {
    this.stroke.points.push(pos);
    this.drawPoint(pos);
    this.polygon.updateBuffer();
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
    const {vertices} = this.polygon;
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
    this.polygon.vertices.splice(-count * 4, count * 4);
    this.vertices.splice(-count, count);
    this.lastSectionLength = 0;
  }

  render(viewportTransform: Transform, sceneTransform: Transform) {
    const {polygon, shader, stroke} = this;
    if (polygon.vertices.length > 0) {
      shader.use();
      shader.setTransforms(viewportTransform, sceneTransform);
      shader.setColor(stroke.color);
      shader.setDisplayWidth(stroke.width * sceneTransform.m11);
      polygon.draw(shader);
    }
  }
}
