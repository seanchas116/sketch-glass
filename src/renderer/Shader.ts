import Color from "../lib/geometry/Color";
import Transform from "../lib/geometry/Transform";

export default
class Shader {
    static current: Shader|undefined;

    aPosition: number;
    aAAOffset: number;
    uTransform: WebGLUniformLocation;
    uColor: WebGLUniformLocation;

    program: WebGLProgram;

    _transform = Transform.identity;
    _color = Color.transparent;

    get vertexShader(): string {
        return `
      precision highp float;
      uniform mat3 uTransform;
      attribute vec2 aPosition;
      attribute lowp float aAAOffset;
      varying lowp float vAAOffset;
      void main(void) {
        vAAOffset = aAAOffset;
        vec3 pos = uTransform * vec3(aPosition, 1.0);
        gl_Position = vec4(pos.xy, 0.0, 1.0);
      }
    `;
    }

    get fragmentShader(): string {
        return `
      precision lowp float;
      uniform vec4 uColor;
      void main(void) {
        gl_FragColor = uColor;
      }
    `;
    }

    constructor(public gl: WebGLRenderingContext) {
        this.setup();

        this.aPosition = gl.getAttribLocation(this.program, 'aPosition') !;
        this.aAAOffset = gl.getAttribLocation(this.program, 'aAAOffset') !;
        this.uTransform = gl.getUniformLocation(this.program, 'uTransform') !;
        this.uColor = gl.getUniformLocation(this.program, 'uColor') !;

        gl.enableVertexAttribArray(this.aPosition);
        gl.enableVertexAttribArray(this.aAAOffset);
    }

    get color() {
        return this._color;
    }
    set color(color: Color) {
        if (!this._color.equals(color)) {
            this.gl.uniform4fv(this.uColor, color.toData());
            this._color = color;
        }
    }

    get transform() {
        return this._transform;
    }
    set transform(transform: Transform) {
        if (!this._transform.equals(transform)) {
            this.gl.uniformMatrix3fv(this.uTransform, false, transform.toData());
            this._transform = transform;
        }
    }

    use() {
        if (Shader.current != this) {
            this.gl.useProgram(this.program);
            Shader.current = this;
        }
    }

    private compile(script: string, type: number) {
        const gl = this.gl;

        const shader = gl.createShader(type);
        gl.shaderSource(shader, script);
        gl.compileShader(shader);

        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
            console.warn("An error occurred compiling the shaders");
            console.warn(gl.getShaderInfoLog(shader));
        }

        return shader;
    }

    private setup() {
        const gl = this.gl;

        const program = this.program = gl.createProgram() !;
        gl.attachShader(program, this.compile(this.vertexShader, gl.VERTEX_SHADER));
        gl.attachShader(program, this.compile(this.fragmentShader, gl.FRAGMENT_SHADER));
        gl.linkProgram(program);
        if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
            console.warn("Failed to link shader program");
        }
        gl.useProgram(program);
    }
}
