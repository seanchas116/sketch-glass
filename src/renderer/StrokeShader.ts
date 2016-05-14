import Shader from './shader';

export default
    class StrokeShader extends Shader {

    uHalfWidth = this.gl.getUniformLocation(this.program, 'uHalfWidth') !;
    _displayWidth = 0;

    get fragmentShader() {
        return `
      precision lowp float;
      uniform vec4 uColor;
      uniform float uHalfWidth;
      varying float vAAOffset;
      void main(void) {
        float dist = abs(vAAOffset);
        float alpha = clamp(uHalfWidth * (1.0 - dist), 0.0, 1.0);
        gl_FragColor = uColor * alpha;
      }
    `;
    }

    constructor(gl: WebGLRenderingContext) {
        super(gl);
    }

    set displayWidth(width: number) {
        if (this._displayWidth != width) {
            this.gl.uniform1f(this.uHalfWidth, width * 0.5);
            this._displayWidth = width;
        }
    }
    get displayWidth() {
        return this._displayWidth;
    }
}
