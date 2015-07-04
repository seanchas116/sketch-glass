'use strict';

import Color = require("./color");

class Background {
  color: Color;

  constructor(color: Color) {
    this.color = color;
  }

  get isOpaque() {
    return this.color.a !== 0;
  }
}

export = Background;
