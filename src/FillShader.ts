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

  constructor(gl: WebGLRenderingContext) {

    var vertexShader = `
      uniform mat3 uViewportTransform;
      uniform mat3 uSceneTransform;
      attribute vec2 aPosition;
      attribute vec2 aUVCoord;
      varying vec2 p;
      void main(void) {
        p = aUVCoord;
        vec3 pos = uViewportTransform * uSceneTransform * vec3(aPosition, 1.0);
        gl_Position = vec4(pos.xy, 0.0, 1.0);
      }
    `;
    var fragmentShader = `
      #extension GL_OES_standard_derivatives : enable
      precision highp float;
      uniform vec4 uColor;
      uniform float uHalfWidth;
      varying vec2 p;
      void main(void) {
        vec2 px = dFdx(p);
        vec2 py = dFdy(p);
        vec2 f = (2.0 * p.x) * vec2(px.x, py.x) - vec2(px.y, py.y);
        float sd = (p.x * p.x - p.y) * inversesqrt(f.x * f.x + f.y * f.y);
        float dist = abs(sd);

        float a = uColor.a * clamp(uHalfWidth - dist, 0.0, 1.0);
        gl_FragColor = uColor * a;
      }
    `;

    super(gl, vertexShader, fragmentShader);

    this.aPosition = gl.getAttribLocation(this.program, 'aPosition');
    this.aUVCoord = gl.getAttribLocation(this.program, 'aUVCoord');
    this.uViewportTransform = gl.getUniformLocation(this.program, 'uViewportTransform');
    this.uSceneTransform = gl.getUniformLocation(this.program, 'uSceneTransform');
    this.uColor = gl.getUniformLocation(this.program, 'uColor');
    this.uHalfWidth = gl.getUniformLocation(this.program, 'uHalfWidth');

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
