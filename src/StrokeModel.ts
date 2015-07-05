"use strict";

import Point = require("./Point");
import QuadraticCurve = require("./QuadraticCurve");
import Stroke = require("./Stroke");
import Line = require("./Line");
import Curve = require("./Curve");
import util = require("./util");

class Model {
  vertices: Point[] = [];
  uvCoords: Point[] = [];
  indices: number[] = [];

  get vertexCount() {
    return this.vertices.length;
  }

  get indexCount() {
    return this.indices.length;
  }

  pushVertex(vertex: Point, uvCoord: Point) {
    this.vertices.push(vertex);
    this.uvCoords.push(uvCoord);
  }

  popVertex() {
    this.vertices.pop();
    this.uvCoords.pop();
  }

  forEachVertex(f: (xy: Point, uv: Point, index: number) => void) {
    var len = this.vertexCount;
    for (var i = 0; i < len; ++i) {
      f(this.vertices[i], this.uvCoords[i], i);
    }
  }

  pushIndices(indices: [number, number, number]) {
    var offset = this.vertices.length;
    this.indices.push(indices.map(i => i + offset)...);
  }
}

enum Convexness {
  ToLeft, ToRight
};

class Segment {
  leftStart = Point.zero;
  rightStart = Point.zero;
  leftEnd = Point.zero;
  rightEnd = Point.zero;
  leftControl = Point.zero;
  rightControl = Point.zero;
  convexness = Convexness.ToLeft;

  curve: QuadraticCurve;

  constructor(prev: QuadraticCurve, curve: QuadraticCurve, width: number) {
    this.curve = curve;
    var hw = 0.5 * width;

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

    var border1 = Line.fromPointAndNormal(p1, p1c.normal.rotate90());

    if (prev) {
      var p1c0 = Line.fromTwoPoints(p1, prev.control);
      border1 = p1c0.bisector(p1c, border1);
    }
    var border2 = Line.fromPointAndNormal(p2, cp2.normal.rotate90());

    if (util.fuzzyEqual(h, 0)) {
      var left = p1p2.translate(hw);
      var right = p1p2.translate(-hw);
      this.leftStart = border1.intersection(left);
      this.rightStart = border1.intersection(right);
      this.leftEnd = border2.intersection(left);
      this.rightEnd = border2.intersection(right);
      this.leftControl = this.leftStart.midpoint(this.leftEnd);
      this.rightControl = this.rightStart.midpoint(this.rightEnd);

    } else {
      if (h > 0) {
        this.convexness = StrokeConvexness.ToLeft;
      } else {
        this.convexness = StrokeConvexness.ToRight;
      }

      var right1 = p1c.translate(-hw);
      var right2 = cp2.translate(-hw);
      var left1 = p1c.translate(hw);
      var left2 = cp2.translate(hw);

      this.leftStart = border1.intersection(left1);
      this.rightStart = border1.intersection(right1);
      this.leftEnd = border2.intersection(left2);
      this.rightEnd = border2.intersection(right2);

      this.leftControl = left1.intersection(left2);
      this.rightControl = right1.intersection(right2);
    }
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

class StrokeModel {
  gl: WebGLRenderingContext;
  vertexBuffer: WebGLBuffer;
  indexBuffer: WebGLBuffer;
  segments: StrokeSegment[] = [];
  stroke: Stroke;
  lastSegmentCount = 0;
  convexVertexCount = 0;
  concaveVertexCount = 0;
  fillVertexCount = 0;

  constructor(gl: WebGLRenderingContext, stroke: Stroke) {
    this.stroke = stroke;
    this.gl = gl;
    this.vertexBuffer = gl.createBuffer();
    this.indexBuffer = gl.createBuffer();

    stroke.whenPush.subscribe(this.pushCurve.bind(this));
    stroke.whenPop.subscribe(this.popCurve.bind(this));

  }

  pushCurve(curve: Curve) {
    var curves = QuadraticCurve.fromCubic(curve)
      .map(toObtuseCurves)
      .reduce((a, x) => a.concat(x));

    this.lastSegmentCount = this.segments.length;

    curves.forEach(this.pushQuadCurve.bind(this));
  }

  pushQuadCurve(curve: QuadraticCurve) {
    var lastSegment = this.segments[this.segments.length - 1];
    var segment = new StrokeSegment(lastSegment.curve, curve, this.stroke.width);
    this.segments.push(segment);
  }

  popCurve() {
    this.segments.splice(this.lastSegmentCount, this.segments.length - this.lastSegmentCount);
    this.lastSegmentCount = this.segments.length;
  }

  updateBuffer(final = false) {
    var concaveModel = new Model();
    var convexModel = new Model();
    var fillModel = new Model();

    this.segments.forEach((segment, i) => {
      if (i !== 0) {
        concaveModel.popVertex();
        convexModel.popVertex();
        fillModel.popVertex();
        fillModel.popVertex();
      }

      var uvStart = new Point(0, 0);
      var uvControl = new Point(0,5, 0);
      var uvEnd = new Point(1, 1);
      if (i % 2 === 0) {
        [uvStart, uvEnd] = [uvEnd, uvStart];
      }
      var uvFill = new Point(0,5, 0,5);

      // left vertices
      var leftModel = segment.convexness === StrokeConvexness.ToLeft ? convexModel : concaveModel;

      leftModel.pushVertex(segment.leftStart, uvStart);
      leftModel.pushVertex(segment.leftControl, uvControl);
      leftModel.pushVertex(segment.leftEnd, uvEnd);
      leftModel.pushIndices([-3, -2, -1]);

      // right vertices
      var rightModel = segment.convexness === StrokeConvexness.ToRight ? convexModel : concaveModel;

      rightModel.pushVertex(segment.rightStart, uvStart);
      rightModel.pushVertex(segment.rightStart, uvControl);
      rightModel.pushVertex(segment.rightEnd, uvEnd);
      rightModel.pushIndices([-3, -2, -1]);

      fillModel.pushVertex(segment.leftStart, uvFill);
      fillModel.pushVertex(segment.rightStart, uvFill);
      fillModel.pushVertex(segment.leftEnd, uvFill);
      fillModel.pushVertex(segment.rightEnd, uvFill);
      fillModel.pushIndices([-4, -3, -2]);
      fillModel.pushIndices([-3, -2, -1]);
    });

    var vertexCount = fillModel.vertexCount + convexModel.vertexCount + concaveModel.vertexCount;
    var vertexData = new Float32Array(vertexCount * 4);

    var indexCount = fillModel.indexCount + convexModel.indexCount + concaveModel.indexCount;
    var indexData = new Uint16Array(indexCount);

    // TODO: use lazy-evaluated collection concat

    fillModel.forEachVertex((xy, uv, i) => {
      vertexData.set(i * 4, [xy.x, xy.y, uv.x, uv.y]);
    });

    convexModel.forEachVertex((xy, uv, i) => {
      vertexData.set((i + fillModel.vertexCount) * 4, [xy.x, xy.y, uv.x, uv.y]);
    });

    concaveModel.forEachVertex((xy, uv, i) => {
      vertexData.set((i + fillModel.vertexCount + convexModel.vertexCount) * 4, [xy.x, xy.y, uv.x, uv.y]);
    });

    var gl = this.gl;
    var mode = final ? gl.STATIC_DRAW : gl.STREAM_DRAW;

    gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, vertexData, mode);

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indexData, mode);
  }

  render() {

  }
}

export = StrokeModel;
