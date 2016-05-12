import Shader from './shader';

export default
class StrokeShader extends Shader {

  uHalfWidth = this.gl.getUniformLocation(this.program, 'uHalfWidth')!;

  get fragmentShader() {
    return `
      precision lowp float;
      uniform vec4 uColor;
      uniform float uHalfWidth;
      varying vec2 vUVCoord;
      void main(void) {
        float dist = abs(vUVCoord.x);
        float alpha = clamp(uHalfWidth * (1.0 - dist), 0.0, 1.0);
        gl_FragColor = uColor * alpha;
      }
    `;
  }

  constructor(gl: WebGLRenderingContext) {
    super(gl);
  }

  setDisplayWidth(width: number) {
    this.gl.uniform1f(this.uHalfWidth, width * 0.5);
  }
}