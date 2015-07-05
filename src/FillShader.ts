import Shader from './shader';
import Color from "./Color";
import Transform from "./Transform";

export default
class FillShader extends Shader {

  aPosition: number;
  aUVCoord: number;
  uTransform: WebGLUniformLocation;
  uColor: WebGLUniformLocation;
  uHalfWidth: WebGLUniformLocation;

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

    gl.enableVertexAttribArray(this.aPosition);
    gl.enableVertexAttribArray(this.aUVCoord);
  }

  setColor(color: Color) {
    this.gl.uniform4fv(this.uColor, color.toData());
  }

  setWidth(width: number) {
    this.gl.uniform1f(this.uHalfWidth, width * 0.5);
  }

  setTransforms(viewportTransform: Transform, sceneTransform: Transform) {
    var transform = sceneTransform.merge(viewportTransform);
    this.gl.uniformMatrix3fv(this.uTransform, false, transform.toData());
  }
}
