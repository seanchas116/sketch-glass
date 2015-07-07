import Shader from './shader';
import Color from "./Color";
import Transform from "./Transform";

export default
class FillShader extends Shader {

  aPosition: number;
  aUVCoord: number;
  uTransform: WebGLUniformLocation;
  uColor: WebGLUniformLocation;
  uAntialiasEdge: WebGLUniformLocation;
  private width = 0;
  private sceneTransform = Transform.identity();

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
      precision mediump float;
      uniform vec4 uColor;
      uniform float uAntialiasEdge;
      varying highp vec2 vUVCoord;
      void main(void) {
        float dist = length(vUVCoord);
        float alpha = 1.0 - smoothstep(uAntialiasEdge, 1.0, dist);
        gl_FragColor = uColor * alpha;
      }
    `;
  }

  constructor(gl: WebGLRenderingContext) {

    super(gl);

    this.aPosition = gl.getAttribLocation(this.program, 'aPosition');
    this.aUVCoord = gl.getAttribLocation(this.program, 'aUVCoord');
    this.uTransform = gl.getUniformLocation(this.program, 'uTransform');
    this.uColor = gl.getUniformLocation(this.program, 'uColor');
    this.uAntialiasEdge = gl.getUniformLocation(this.program, 'uAntialiasEdge');

    gl.enableVertexAttribArray(this.aPosition);
    gl.enableVertexAttribArray(this.aUVCoord);
  }

  setColor(color: Color) {
    this.gl.uniform4fv(this.uColor, color.toData());
  }

  setWidth(width: number) {
    this.width = width;
    this.updateRadius();
  }

  setTransforms(viewportTransform: Transform, sceneTransform: Transform) {
    this.sceneTransform = sceneTransform;
    var transform = sceneTransform.merge(viewportTransform);
    this.gl.uniformMatrix3fv(this.uTransform, false, transform.toData());
    this.updateRadius();
  }

  private updateRadius() {
    const radius = this.width * this.sceneTransform.m11 * 0.5;
    const edge = (radius - 1) / radius;
    console.log(`radius: ${radius}`);
    console.log(`edge: ${edge}`);
    this.gl.uniform1f(this.uAntialiasEdge, edge);
  }
}
