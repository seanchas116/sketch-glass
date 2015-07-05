"use strict";

var util = {
  // 32bit float epsilon
  EPSILON: 1.19209290e-7,

  fuzzyEqual(x: number, y: number) {
    return Math.abs(x - y) <= util.EPSILON;
  }
};

export = util;
