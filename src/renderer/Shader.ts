import Color from "../lib/geometry/Color";
import Transform from "../lib/geometry/Transform";

export default
    class Shader {

    aPosition: number;
    aUVCoord: number;
    uTransform: WebGLUniformLocation;
    uColor: WebGLUniformLocation;

    program: WebGLProgram;
    viewportTransform = Transform.identity;
    sceneTransform = Transform.identity;

    get vertexShader(): string {
        return `
      precision highp float;
      uniform mat3 uTransform;
      attribute vec2 aPosition;
      attribute mediump vec2 aUVCoord;
      varying mediump vec2 vUVCoord;
      void main(void) {
        vUVCoord = aUVCoord;
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
        this.aUVCoord = gl.getAttribLocation(this.program, 'aUVCoord') !;
        this.uTransform = gl.getUniformLocation(this.program, 'uTransform') !;
        this.uColor = gl.getUniformLocation(this.program, 'uColor') !;

        gl.enableVertexAttribArray(this.aPosition);
        gl.enableVertexAttribArray(this.aUVCoord);

        this.updateTransforms();
    }

    setColor(color: Color) {
        this.gl.uniform4fv(this.uColor, color.toData());
    }

    use() {
        this.gl.useProgram(this.program);
    }

    setTransforms(viewportTransform: Transform, sceneTransform: Transform) {
        if (this.viewportTransform != viewportTransform || this.sceneTransform != sceneTransform) {
            this.viewportTransform = viewportTransform;
            this.sceneTransform = sceneTransform;
            this.updateTransforms();
        }
    }

    private updateTransforms() {
        const transform = this.sceneTransform.merge(this.viewportTransform);
        this.gl.uniformMatrix3fv(this.uTransform, false, transform.toData());
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
