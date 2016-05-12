const SAT = require("sat");
import Vec2 from "../lib/geometry/Vec2";

export default
class StrokeCollider {
  satPolygons: any[];

  constructor(width: number, vertices: Vec2[]) {
    const polygons: any[] = [];
    for (let i = 0; i < vertices.length - 1; ++i) {
      const p1 = vertices[i];
      const p2 = vertices[i+1];
      const normal = p2.sub(p1).normal();
      if (normal == undefined) { continue; }
      const toLeft = normal.mul(width / 2);
      const toRight = normal.mul(-width / 2);
      const points = [
        p1.add(toLeft),
        p1.add(toRight),
        p2.add(toRight),
        p2.add(toLeft),
      ];
      const poly = new SAT.Polygon(new SAT.Vector(),
        points.map(({x, y}) => new SAT.Vector(x, y))
      );
      polygons.push(poly);
    }
    this.satPolygons = polygons;
  }

  collides(other: StrokeCollider) {
    for (const p1 of this.satPolygons) {
      for (const p2 of other.satPolygons) {
        if (SAT.testPolygonPolygon(p1, p2)) {
          return true;
        }
      }
    }
    return false;
  }
}
