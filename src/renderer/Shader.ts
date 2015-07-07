export default
class Shader {

  gl: WebGLRenderingContext;
  program: WebGLProgram;

  get vertexShader(): string {
    throw new Error("vertex shader not specified");
  }

  get fragmentShader(): string {
    throw new Error("fragment shader not specified");
  }

  constructor(gl: WebGLRenderingContext) {
    this.gl = gl;
    this._setup();
  }

  use() {
    this.gl.useProgram(this.program);
  }

  _compile(script: string, type: number) {
    var gl = this.gl;

    var shader = gl.createShader(type);
    gl.shaderSource(shader, script);
    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      console.warn("An error occurred compiling the shaders");
      console.warn(gl.getShaderInfoLog(shader));
      return null;
    }

    return shader;
  }

  _setup() {
    var gl = this.gl;

    var program = this.program = gl.createProgram();
    gl.attachShader(program, this._compile(this.vertexShader, gl.VERTEX_SHADER));
    gl.attachShader(program, this._compile(this.fragmentShader, gl.FRAGMENT_SHADER));
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.warn("Failed to link shader program");
    }
    gl.useProgram(program);
  }
}
