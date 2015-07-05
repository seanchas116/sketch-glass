export default
class Shader {

  gl: WebGLRenderingContext;
  program: WebGLProgram;

  constructor(gl: WebGLRenderingContext, vertexShader: string, fragmentShader: string) {
    this.gl = gl;
    this._setup(vertexShader, fragmentShader);
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

  _setup(vertexShaderScript: string, fragmentShaderScript: string) {
    var gl = this.gl;

    var program = this.program = gl.createProgram();
    gl.attachShader(program, this._compile(vertexShaderScript, gl.VERTEX_SHADER));
    gl.attachShader(program, this._compile(fragmentShaderScript, gl.FRAGMENT_SHADER));
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.warn("Failed to link shader program");
    }
    gl.useProgram(program);
  }
}
