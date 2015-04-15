'use strict';

import Shader = require('./shader');
import Color = require("./Color");
import Transform = require("./Transform");

class FillShader extends Shader {

  aPosition: number;
  aUVCoord: number;
  uViewportTransform: WebGLUniformLocation;
  uSceneTransform: WebGLUniformLocation;
  uColor: WebGLUniformLocation;
  uHalfWidth: WebGLUniformLocation;

  get vertexShader() {
    return `
      uniform mat3 uViewportTransform;
      uniform mat3 uSceneTransform;
      attribute vec2 aPosition;
      attribute vec2 aUVCoord;
      varying vec2 vUVCoord;
      void main(void) {
        vUVCoord = aUVCoord;
        vec3 pos = uViewportTransform * uSceneTransform * vec3(aPosition, 1.0);
        gl_Position = vec4(pos.xy, 0.0, 1.0);
      }
    `;
  }

  get fragmentShader() {
    return `
      uniform lowp vec4 uColor;
      void main(void) {
        gl_FragColor = uColor;
      }
    `;
  }

  constructor(gl: WebGLRenderingContext) {

    super(gl);

    this.aPosition = gl.getAttribLocation(this.program, 'aPosition');
    this.aUVCoord = gl.getAttribLocation(this.program, 'aUVCoord');
    this.uViewportTransform = gl.getUniformLocation(this.program, 'uViewportTransform');
    this.uSceneTransform = gl.getUniformLocation(this.program, 'uSceneTransform');
    this.uColor = gl.getUniformLocation(this.program, 'uColor');

    gl.enableVertexAttribArray(this.aPosition);
    gl.enableVertexAttribArray(this.aUVCoord);
  }

  setColor(color: Color) {
    this.gl.uniform4fv(this.uColor, color.toData());
  }

  setWidth(width: number) {
    this.gl.uniform1f(this.uHalfWidth, width * 0.5);
  }

  setViewportTransform(transform: Transform) {
    this.gl.uniformMatrix3fv(this.uViewportTransform, false, transform.toData());
  }

  setSceneTransform(transform: Transform) {
    this.gl.uniformMatrix3fv(this.uSceneTransform, false, transform.toData());
  }
}

export = FillShader;
