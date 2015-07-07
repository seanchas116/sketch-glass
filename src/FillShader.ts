import Shader from './shader';
import Color from "./Color";
import Transform from "./Transform";

export default
class FillShader extends Shader {

  aPosition: number;
  aUVCoord: number;
  uTransform: WebGLUniformLocation;
  uColor: WebGLUniformLocation;
  uDisplayHalfWidth: WebGLUniformLocation;
  private width = 0;
  private transform = Transform.identity();

  get vertexShader() {
    return `
      uniform mat3 uTransform;
      attribute vec2 aPosition;
      attribute vec2 aUVCoord;
      varying vec2 vUVCoord;
      void main(void) {
        vUVCoord = aUVCoord;
        vec3 pos = uTransform * vec3(aPosition, 1.0);
        gl_Position = vec4(pos.xy, 0.0, 1.0);
      }
    `;
  }

  get fragmentShader() {
    return `
      uniform lowp vec4 uColor;
      uniform lowp float uDisplayHalfWidth;
      void main(void) {
        gl_FragColor = uColor;
      }
    `;
  }

  constructor(gl: WebGLRenderingContext) {

    super(gl);

    this.aPosition = gl.getAttribLocation(this.program, 'aPosition');
    this.aUVCoord = gl.getAttribLocation(this.program, 'aUVCoord');
    this.uTransform = gl.getUniformLocation(this.program, 'uTransform');
    this.uColor = gl.getUniformLocation(this.program, 'uColor');
    this.uDisplayHalfWidth = gl.getUniformLocation(this.program, 'uDisplayHalfWidth');

    gl.enableVertexAttribArray(this.aPosition);
    gl.enableVertexAttribArray(this.aUVCoord);
  }

  setColor(color: Color) {
    this.gl.uniform4fv(this.uColor, color.toData());
  }

  setWidth(width: number) {
    this.width = width;
    this.updateWidth();
  }

  setTransforms(viewportTransform: Transform, sceneTransform: Transform) {
    var transform = this.transform = sceneTransform.merge(viewportTransform);
    this.gl.uniformMatrix3fv(this.uTransform, false, transform.toData());
    this.updateWidth();
  }

  private updateWidth() {
    this.gl.uniform1f(this.uDisplayHalfWidth, this.width * this.transform.m11 * 0.5);
  }
}
