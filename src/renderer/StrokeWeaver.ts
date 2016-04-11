import Model from "./Model";
import Point from '../lib/geometry/Point';
import Curve from '../lib/geometry/Curve';
import Color from '../lib/geometry/Color';
import Stroke from "../model/Stroke";
import * as _ from 'lodash';
import * as Rx from "rx";
import DisposableBag from "../lib/rx/DisposableBag";

export default
class StrokeWeaver extends DisposableBag {
  polygon: [Point, Point][] = [];
  buffer: WebGLBuffer;
  model: Model;
  lastSegmentCount = 0;

  constructor(public gl: WebGLRenderingContext, public stroke: Stroke) {
    super();
    this.buffer = gl.createBuffer();
    this.addDisposable(stroke.whenPointAdded.forEach(point => {
      this.addPoint(point);
    }));
    this.model = new Model(gl, []);
  }

  addPoint(point: Point) {
    this.rewindLastSegments();

    const points = this.stroke.points;
    const nPoints = points.length;
    console.log(nPoints);

    if (nPoints === 2) {
      this.addSegment(points[0], points[1]);
      this.lastSegmentCount = 1;
    } else if (nPoints === 3) {
      this.addInterpolatedSegments(points[0], points[0], points[1], points[2]);
      this.lastSegmentCount = this.addInterpolatedSegments(points[0], points[1], points[2], points[2]);
    } else if (nPoints > 3) {
      this.addInterpolatedSegments(points[nPoints - 4], points[nPoints - 3], points[nPoints - 2], points[nPoints - 1]);
      this.lastSegmentCount = this.addInterpolatedSegments(points[nPoints - 3], points[nPoints - 2], points[nPoints - 1], points[nPoints - 1]);
    }
    this.model.updateBuffer();
  }

  addInterpolatedSegments(p1: Point, p2: Point, p3: Point, p4: Point) {
    const points = Curve.bSpline(p1, p2, p3, p4).subdivide();
    const nSegment = points.length - 1
    for (let i = 0; i < nSegment; ++i) {
      this.addSegment(points[i], points[i + 1]);
    }
    return nSegment;
  }

  addSegment(last: Point, point: Point) {
    const width = this.stroke.width;
    const vertices = this.model.vertices;

    const normal = point.sub(last).normalize().rotate90();
    const toLeft = normal.mul(width / 2);
    const toRight = normal.mul(-width / 2);
    vertices.push([last.add(toLeft), new Point(-1, 0)]);
    vertices.push([last.add(toRight), new Point(1, 0)]);
    vertices.push([point.add(toLeft), new Point(-1, 0)]);
    vertices.push([point.add(toRight), new Point(1, 0)]);
  }

  rewindLastSegments() {
    const vertexCount = this.lastSegmentCount * 4;
    const vertices = this.model.vertices;
    vertices.splice(vertices.length - vertexCount);
    this.lastSegmentCount = 0;
  }
}
