/// <reference path="../../typings/bundle.d.ts" />
'use strict';

class Polygon {
  gl: WebGLRenderingContext;
  buffer: WebGLBuffer;
  vertices: Float32Array[];
  isLoaded = false;

  constructor(gl: WebGLRenderingContext, vertices: Float32Array[]) {
    this.gl = gl;
    this.vertices = vertices;
  }

  load() {
    if (this.isLoaded) {
      throw new Error('polygon already loaded');
    }

    var gl = this.gl;
    var buffer = this.buffer = gl.createBuffer();

    var data = new Float32Array(this.vertices.length * 2);
    this.vertices.forEach((v, i) => {
      data.set(v, i * 2);
    });

    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);

    this.isLoaded = true;
  }

  unload() {
    this.gl.deleteBuffer(this.buffer);
    this.isLoaded = false;
  }
}

export = Polygon;
