'use strict';

import Point = require('./Point');

class Transform {
  m11: number;
  m12: number;
  m21: number;
  m22: number;
  dx: number;
  dy: number;

  constructor(m11: number, m12: number, m21: number, m22: number, dx: number, dy: number) {
    this.m11 = m11;
    this.m12 = m12;
    this.m21 = m21;
    this.m22 = m22;
    this.dx = dx;
    this.dy = dy;
  }

  merge(other: Transform) {
    // other * this
    // [P u] [Q v]   [PQ Pv + u]
    // [0 1] [0 1] = [0  1     ]
    var m11 = other.m11 * this.m11 + other.m21 * this.m12;
    var m12 = other.m11 * this.m21 + other.m21 * this.m22;
    var m21 = other.m12 * this.m11 + other.m22 * this.m12;
    var m22 = other.m12 * this.m21 + other.m22 * this.m22;
    var dx = other.m11 * this.dx + other.m21 * this.dy + other.dx;
    var dy = other.m12 * this.dx + other.m22 * this.dy + other.dy;
    return new Transform(m11, m12, m21, m22, dx, dy);
  }

  invert() {
    // [P u]^-1   [P^-1 -P^1 * v]
    // [0 1]    = [0    1       ]
    var det = this.m11 * this.m22 - this.m12 * this.m21;
    var m11 = this.m22 / det;
    var m12 = -this.m12 / det;
    var m21 = -this.m21 / det;
    var m22 = this.m11 / det;
    var dx = -(m11 * this.dx + m21 * this.dy);
    var dy = -(m12 * this.dx + m22 * this.dy);
    return new Transform(m11, m12, m21, m22, dx, dy);
  }

  translate(delta: Point) {
    return new Transform(
      this.m11, this.m12, this.m21, this.m22,
      this.dx + delta.x, this.dy + delta.y);
  }

  scale(scale: number) {
    return new Transform(
      this.m11 * scale, this.m12 * scale, this.m21 * scale, this.m22 * scale,
      this.dx * scale, this.dy * scale);
  }

  static identity() {
    return new Transform(1, 0, 0, 1, 0, 0);
  }

  static scale(scale: number) {
    return new Transform(scale, 0, 0, scale, 0, 0);
  }

  static translation(translation: Point) {
    return new Transform(1, 0, 0, 1, translation.x, translation.y);
  }
}

export = Transform;
