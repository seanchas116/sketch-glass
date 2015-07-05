import Point from './Point';
import Curve from './Curve';
import Color from './Color';
import Rect from './Rect';
import QuadraticCurve from "./QuadraticCurve";
import Line from "./Line";
import util from "./util";
import Transform from "./Transform";
import _ from 'lodash';
const earcut = require("earcut");

var arrayPush = Array.prototype.push;

export default
class Stroke {
  points: Point[] = [];
  color = new Color(0,0,0,1);
  width = 1;
  type = "pen";
  gl: WebGLRenderingContext;
  vertexBuffer: WebGLBuffer;
  boundingIndexBuffer: WebGLBuffer;
  _quadCurveLists: QuadraticCurve[][] = [];

  constructor(gl: WebGLRenderingContext) {
    this.gl = gl;
    this.vertexBuffer = gl.createBuffer();
    this.boundingIndexBuffer = gl.createBuffer();
  }

  addPoint(point: Point) {
    this.points.push(point);

    var count = this.points.length;

    if (count >= 3) {
      this._popCurve();
      // recalculate last curve
      this._pushCurve(this._curveAt(count - 3));
    }
    if (count >= 2) {
      // push curve
      this._pushCurve(this._curveAt(count - 2));
    }

    this._updateBuffer();
  }

  _updateBuffer(final = false) {
    var vertexData = new Float32Array(this.vertices.length * 4);

    for (var i = 0; i < this.vertices.length; ++i) {
      var xy = this.vertices[i];
      var uv = this.uvCoords[i];
      var i4 = i * 4;
      vertexData[i4] = xy.x;
      vertexData[i4 + 1] = xy.y;
      vertexData[i4 + 2] = uv.x;
      vertexData[i4 + 3] = uv.y;
    }

    var indexData = new Uint16Array(this.indices);

    var gl = this.gl;
    var mode = final ? gl.STATIC_DRAW : gl.STREAM_DRAW;

    gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, vertexData, mode);

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indexData, mode);
  }

  _generateVertices() {
    const vertices: [Point, Point][] = [];
    let curveCount = 0;
    const boundingPolygonIndices: number[] = [];
    const convexIndices: number[] = [];
    const concaveIndices: number[] = [];

    for (const curves of this._quadCurveLists) {
      for (const curve of curves) {
        const p1p2 = curve.end.sub(curve.start);
        const p1c = curve.control.sub(curve.start);
        const det = p1c.x * p1p2.y - p1p2.x * p1c.y;
        const isConvex = det > 0;
        const index = vertices.length;

        if (isConvex) {
          boundingPolygonIndices.push(index, index + 1);
          convexIndices.push(index, index + 1, index + 2);
        } else {
          boundingPolygonIndices.push(index);
          concaveIndices.push(index, index + 1, index + 2);
        }

        if (curveCount % 2) {
          vertices.push([curve.start, new Point(0, 0)]);
          vertices.push([curve.control, new Point(0.5, 0)]);
          vertices.push([curve.end, new Point(1, 1)]);
        } else {
          vertices.push([curve.end, new Point(0, 0)]);
          vertices.push([curve.control, new Point(0.5, 0)]);
          vertices.push([curve.start, new Point(1, 1)]);
        }
      }
    }

    const boundingVertices = boundingPolygonIndices.map(i => vertices[i][0]);
    const boundingIndices: number[] = earcut(boundingVertices).map((i: number) => boundingPolygonIndices[i]);

    return {vertices, boundingIndices, convexIndices, concaveIndices};
  }

  _curveAt(i: number) {
    var prev = this.points[i - 1];
    var start = this.points[i];
    var end = this.points[i + 1];
    var next = this.points[i + 2];

    return Curve.bSpline(prev || start, start, end, next || end);
  }

  _pushCurve(curve: Curve) {
    var curves = QuadraticCurve.fromCubic(curve)
      .map(toObtuseCurves)
      .reduce((a, x) => a.concat(x));

    this._quadCurveLists.push(curves);
  }

  _popCurve() {
    this._quadCurveLists.pop();
  }
}

// eliminate quadratic curves with acute control point
function toObtuseCurves(curve: QuadraticCurve): QuadraticCurve[] {
  var cp1 = curve.start.sub(curve.control);
  var cp2 = curve.end.sub(curve.control);
  if (cp1.dot(cp2) > 0) {
    return curve.split(0.5)
      .map(toObtuseCurves)
      .reduce((a, x) => a.concat(x));
  }
  return [curve];
}
