import Model from "./Model";
import Point from '../lib/geometry/Point';
import Curve from '../lib/geometry/Curve';
import Color from '../lib/geometry/Color';
import Stroke from "../model/Stroke";
import _ from 'lodash';
import Rx from "rx";

export default
class StrokeWeaver {
  polygon: [Point, Point][] = [];
  buffer: WebGLBuffer;
  subscriptions: Rx.IDisposable[] = [];
  model: Model;

  constructor(public gl: WebGLRenderingContext, public stroke: Stroke) {
    this.buffer = gl.createBuffer();
    this.subscriptions.push(stroke.whenPointAdded.forEach(point => {
      this.addPoint(point);
    }));
    this.model = new Model(gl, []);
  }

  dispose() {
    this.subscriptions.forEach(d => d.dispose());
  }

  addPoint(point: Point) {
    const points = this.stroke.points;
    const width = this.stroke.width;
    const vertices = this.model.vertices;

    if (points.length >= 2) {
      const last = points[points.length - 2];
      const normal = point.sub(last).normalize().rotate90();
      const toLeft = normal.mul(width / 2);
      const toRight = normal.mul(-width / 2);
      vertices.push([last.add(toLeft), new Point(-1, 0)]);
      vertices.push([last.add(toRight), new Point(1, 0)]);
      vertices.push([point.add(toLeft), new Point(-1, 0)]);
      vertices.push([point.add(toRight), new Point(1, 0)]);
    }
    this.model.updateBuffer();
  }
}
