import Point from './Point';
import Curve from './Curve';
import Color from './Color';
import Rect from './Rect';
import QuadraticCurve from "./QuadraticCurve";
import Line from "./Line";
import util from "./util";
import Transform from "./Transform";
import _ from 'lodash';

var arrayPush = Array.prototype.push;

export default
class Stroke {
  points: Point[] = [];
  color = new Color(0,0,0,1);
  width = 1;
  type = "pen";
  vertices: Point[] = [];
  uvCoords: Point[] = [];
  indices: number[] = [];
  gl: WebGLRenderingContext;
  vertexBuffer: WebGLBuffer;
  indexBuffer: WebGLBuffer;
  quadCurves: QuadraticCurve[] = [];
  _lastQuadControl: Point;
  _quadCount = 0;

  _prevVertexCount = 0;
  _prevIndexCount = 0;
  _prevLastQuadControl: Point;

  constructor(gl: WebGLRenderingContext) {
    this.gl = gl;
    this.vertexBuffer = gl.createBuffer();
    this.indexBuffer = gl.createBuffer();
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

    this._prevVertexCount = this.vertices.length;
    this._prevIndexCount = this.indices.length;
    this._prevLastQuadControl = this._lastQuadControl;

    curves.forEach(this._pushQuadCurve.bind(this));
  }

  _pushQuadCurve(curve: QuadraticCurve) {
    var hw = 0.5 * this.width;

    var p1 = curve.start;
    var p2 = curve.end;

    if (p1.fuzzyEquals(p2)) {
      return;
    }

    var c = curve.control;

    var p1p2 = Line.fromTwoPoints(p1, p2);
    var h = p1p2.signedDistance(c);

    var p1c = Line.fromTwoPoints(p1, c);
    var cp2 = Line.fromTwoPoints(c, p2);

    var isStart = !this._lastQuadControl;

    var border1 = Line.fromPointAndNormal(p1, p1c.normal.rotate90());

    if (!isStart) {
      var p1c0 = Line.fromTwoPoints(p1, this._lastQuadControl);
      border1 = p1c0.bisector(p1c, border1);
    }
    var border2 = Line.fromPointAndNormal(p2, cp2.normal.rotate90());

    if (Math.abs(h) < util.EPSILON) {
      // all points are on single line

      var right = p1p2.translate(-hw);
      var left = p1p2.translate(hw);
      var v11 = border1.intersection(right);
      var v12 = border1.intersection(left);
      var v21 = border2.intersection(right);
      var v22 = border2.intersection(left);

      if (!isStart) {
        this.vertices.splice(-2, 2, v11, v12);
      }

      this._pushPolygon(
        [v11, v12, v21, v22],
        [new Point(10000, 0), new Point(-10000, 0), new Point(10000, 1), new Point(-10000, 1)],
        [
          0, 1, 3,
          0, 3, 2
        ]
      );
    } else {
      var xy2uv = Transform.fromPoints(p1, c, p2, new Point(0, 0), new Point(0.5, 0), new Point(1, 1));

      if (h > 0) {
        // control points is in left

        var right = p1p2.translate(-hw);
        var left1 = p1c.translate(hw);
        var left2 = cp2.translate(hw);

        var v11 = border1.intersection(right);
        var v12 = border1.intersection(left1);
        var vc = left1.intersection(left2);
        var v21 = border2.intersection(right);
        var v22 = border2.intersection(left2);

        if (!isStart) {
          this.vertices.splice(-2, 2, v11, v12);
        }

        var vertices = [v11, v12, vc, v21, v22];

        this._pushPolygon(
          vertices,
          vertices.map(v => v.transform(xy2uv)),
          [
            0, 1, 2,
            0, 2, 4,
            0, 4, 3
          ]
        );
      } else {
        // control points is in right

        var left = p1p2.translate(hw);
        var right1 = p1c.translate(-hw);
        var right2 = cp2.translate(-hw);

        var v11 = border1.intersection(right1);
        var v12 = border1.intersection(left);
        var vc = right1.intersection(right2);
        var v21 = border2.intersection(right2);
        var v22 = border2.intersection(left);

        if (!isStart) {
          this.vertices.splice(-2, 2, v11, v12);
        }

        var vertices = [v11, v12, vc, v21, v22];

        this._pushPolygon(
          vertices,
          vertices.map(v => v.transform(xy2uv)),
          [
            0, 1, 4,
            0, 4, 3,
            0, 3, 2
          ]
        );
      }
    }

    this._lastQuadControl = c;
  }

  _pushPolygon(vertices: Point[], uvCoords: Point[], indices: number[]) {
    if (vertices.length !== uvCoords.length) {
      throw new Error("wrong uv coords count");
    }
    arrayPush.apply(this.indices, indices.map(n => n + this.vertices.length));
    arrayPush.apply(this.vertices, vertices);
    arrayPush.apply(this.uvCoords, uvCoords);
  }

  _popCurve() {
    this.vertices.splice(this._prevVertexCount);
    this.uvCoords.splice(this._prevVertexCount);
    this.indices.splice(this._prevIndexCount);
    this._lastQuadControl = this._prevLastQuadControl;
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
