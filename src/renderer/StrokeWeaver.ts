import Stroke from "../model/Stroke";
import Model from "./Model";
import Vec2 from "../lib/geometry/Vec2";
import TreeDisposable from "../lib/TreeDisposable";
const SAT = require("sat");

export default
class StrokeWeaver extends TreeDisposable {
  model = new Model(this.gl, []);
  lastSectionLength = 0;
  satPolygons: any[];

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
    this.lastSectionLength = (vertices.length - 1) * 4;
  }

  rewindLastSection() {
    const {vertices} = this.model;
    const count = this.lastSectionLength;
    vertices.splice(-count, count);
    this.lastSectionLength = 0;
  }

  generateSATPolygons() {
    const satPolygons: any[] = [];
    const {vertices} = this.model;
    for (let i = 0; i < vertices.length; i += 4) {
      const points = [
        vertices[i+1][0], vertices[i][0], vertices[i+2][0], vertices[i+3][0]
      ];
      const poly = new SAT.Polygon(new SAT.Vector(),
        points.map(({x, y}) => new SAT.Vector(x, y))
      );
      satPolygons.push(poly);
    }
    return satPolygons;
  }

  collides(satPolygon: any) {
    if (!this.satPolygons) {
      this.satPolygons = this.generateSATPolygons();
    }
    for (const poly of this.satPolygons) {
      if (!SAT.testPolygonPolygon(poly, satPolygon)) {
        return false;
      }
    }
    return true;
  }
}
