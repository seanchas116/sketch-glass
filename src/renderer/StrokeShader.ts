import Shader from './shader';

export default
class StrokeShader extends Shader {

  uAntialiasEdge: WebGLUniformLocation;

  get fragmentShader() {
    return `
      precision lowp float;
      uniform vec4 uColor;
      uniform float uAntialiasEdge;
      varying vec2 vUVCoord;
      void main(void) {
        float dist = length(vUVCoord);
        float alpha = 1.0 - smoothstep(uAntialiasEdge, 1.0, dist);
        gl_FragColor = uColor * alpha;
      }
    `;
  }

  constructor(gl: WebGLRenderingContext) {
    super(gl);

    this.uAntialiasEdge = gl.getUniformLocation(this.program, 'uAntialiasEdge');
  }

  setDisplayWidth(width: number) {
    const radius = width * 0.5;
    const edge = (radius - 1) / radius;
    this.gl.uniform1f(this.uAntialiasEdge, edge);
  }
}
