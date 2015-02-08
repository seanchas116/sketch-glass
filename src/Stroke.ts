'use strict';

import Point = require('./Point');
import Color = require('./Color');

class Stroke {
  points: Point[] = [];
  color = new Color(0,0,0,1);
  composition = 'source-over';
  width = 1;
}

export = Stroke;
