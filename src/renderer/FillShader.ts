import Shader from './shader';

export default
class FillShader extends Shader {

  uAntialiasEdge: WebGLUniformLocation;

  get fragmentShader() {
    return `
      precision mediump float;
      uniform vec4 uColor;
      varying highp vec2 vUVCoord;
      void main(void) {
        float dist = abs(vUVCoord.x);
        float edge = vUVCoord.y;
        float alpha = 1.0 - smoothstep(edge, 1.0, dist);
        gl_FragColor = uColor * alpha;
      }
    `;
  }

  constructor(gl: WebGLRenderingContext) {
    super(gl);
  }
}
