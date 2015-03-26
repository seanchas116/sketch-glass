/// <reference path="../typings/bundle.d.ts" />
'use strict';

import _ = require('lodash');
import Point = require('./Point');
import Rect = require('./Rect');
import Transform = require('./Transform');
import Stroke = require('./Stroke');
import RendererTile = require('./RendererTile');

var TILE_SIZE = 128;

interface RendererOptions {
  tiled?: boolean;
}

class Renderer {

  isTiled = true;
  element = document.createElement('div');
  tiles: RendererTile[] = [];
  strokes: Stroke[] = [];
  isRenderQueued = false;
  devicePixelRatio = 1;
  width = 0;
  height = 0;
  dirtyRect = Rect.empty;

  _transform = Transform.identity();
  transformToPixel = Transform.identity();

  set transform(transform: Transform) {
    this._transform = transform;
    this.transformToPixel = transform.scale(this.devicePixelRatio);
    this.dirtyWhole();
    this.updateTileTransforms();
  }

  get transform() {
    return this._transform;
  }

  constructor(opts: RendererOptions) {
    var options = {
      tiled: true
    };
    _.assign(options, opts);

    this.isTiled = options.tiled;
    this.element.className = 'canvas-area__renderer';
    window.addEventListener('resize', this.onResize.bind(this));
    this.onResize();
  }

  add(stroke: Stroke) {
    this.strokes.push(stroke);
  }

  addDirtyRect(rect: Rect) {
    this.dirtyRect = this.dirtyRect.union(rect.transform(this.transformToPixel).boundingIntegerRect());
  }

  dirtyWhole() {
    this.dirtyRect = Rect.fromMetrics(0, 0, this.width * this.devicePixelRatio, this.height * this.devicePixelRatio);
  }

  update() {
    if (!this.isRenderQueued) {
      this.isRenderQueued = true;
      setImmediate(() => {
        this.beginRendering();
        this.render();
        this.isRenderQueued = false;
      });
    }
  }

  clear() {
    this.beginRendering();
  }

  beginRendering(clear = true) {
    this.tiles.forEach(tile => {
      tile.beginRendering(this.dirtyRect, clear);
    });
    this.dirtyRect = Rect.empty;
  }

  drawOther(other: Renderer) {
    this.beginRendering(false);
    this.tiles.forEach(tile => {
      other.tiles.forEach(otherTile => {
        tile.drawOther(otherTile);
      });
    });
  }

  render() {
    this.tiles.forEach(tile => {
      this.strokes.forEach(stroke => {
        tile.drawStroke(stroke);
      })
    });
  }

  updateTileTransforms() {
    this.tiles.forEach(tile => {
      tile.setRendererTransform(this.transformToPixel);
    });
  }

  onResize() {
    var width = this.width = window.innerWidth;
    var height = this.height = window.innerHeight;
    var devicePixelRatio = this.devicePixelRatio = window.devicePixelRatio || 1;
    this.transformToPixel = this.transform.scale(devicePixelRatio);
    console.log(`resized to ${width} * ${height}, pixel ratio ${devicePixelRatio}`);

    this.rebuildTiles();
    this.update();
  }

  rebuildTiles() {
    var dpr = this.devicePixelRatio;

    var pixelWidth = this.width * dpr;
    var pixelHeight = this.height * dpr;

    var tileSize: number;

    if (this.isTiled) {
      // tile size: the maximum multiple of devicePixelRatio which does not exceed TILE_SIZE
      var dpr = this.devicePixelRatio;
      tileSize = Math.floor(TILE_SIZE / dpr) * dpr;
      while (Math.floor(tileSize) !== tileSize) {
        tileSize -= dpr;
      }
    }
    else {
      tileSize =  Math.max(pixelWidth, pixelHeight);
    }

    var tileXCount = Math.ceil(pixelWidth / tileSize);
    var tileYCount = Math.ceil(pixelHeight / tileSize);

    this.tiles.forEach(tile => {
      this.element.removeChild(tile.element);
    });
    this.tiles = [];

    for (var tileY = 0; tileY < tileYCount; ++tileY) {
      var tileHeight: number;
      if (tileY === tileYCount - 1) {
        tileHeight = pixelHeight % tileSize;
        if (tileHeight === 0) {
          tileHeight = tileSize;
        }
      }
      else {
        tileHeight = tileSize;
      }

      for (var tileX = 0; tileX < tileXCount; ++tileX) {
        var tileWidth: number;
        if (tileX === tileXCount - 1) {
          tileWidth = pixelWidth % tileSize;
          if (tileWidth === 0) {
            tileWidth = tileSize;
          }
        }
        else {
          tileWidth = tileSize;
        }

        var topLeft = new Point(tileX, tileY).mul(tileSize);
        var bottomRight = topLeft.add(new Point(tileWidth, tileHeight));
        var tile = new RendererTile(new Rect(topLeft, bottomRight));

        this.tiles.push(tile);
        this.element.appendChild(tile.element);
      }
    }

    this.updateTileTransforms();
    this.update();
  }
}

export = Renderer;
