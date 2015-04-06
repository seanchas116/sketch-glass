'use strict';

import Shader = require('./shader');
import Color = require("./Color");
import Transform = require("./Transform");

class FillShader extends Shader {

  aPosition: number;
  uViewportTransform: WebGLUniformLocation;
  uSceneTransform: WebGLUniformLocation;
  uColor: WebGLUniformLocation;

  constructor(gl: WebGLRenderingContext) {

    var vertexShader = `
      uniform mat3 uViewportTransform;
      uniform mat3 uSceneTransform;
      attribute vec2 aPosition;
      void main(void) {
        vec3 pos = uViewportTransform * uSceneTransform * vec3(aPosition, 1.0);
        gl_Position = vec4(pos.xy, 0.0, 1.0);
      }
    `;
    var fragmentShader = `
      precision mediump float;
      uniform vec4 uColor;
      void main(void) {
        gl_FragColor = uColor;
      }
    `;

    super(gl, vertexShader, fragmentShader);

    this.aPosition = gl.getAttribLocation(this.program, 'aPosition');
    this.uViewportTransform = gl.getUniformLocation(this.program, 'uViewportTransform');
    this.uSceneTransform = gl.getUniformLocation(this.program, 'uSceneTransform');
    this.uColor = gl.getUniformLocation(this.program, 'uColor');

    gl.enableVertexAttribArray(this.aPosition);
  }

  setColor(color: Color) {
    this.gl.uniform4fv(this.uColor, color.toData());
  }

  setViewportTransform(transform: Transform) {
    this.gl.uniformMatrix3fv(this.uViewportTransform, false, transform.toData());
  }

  setSceneTransform(transform: Transform) {
    this.gl.uniformMatrix3fv(this.uSceneTransform, false, transform.toData());
  }
}

export = FillShader;
