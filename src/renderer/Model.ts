import Shader from "./Shader";
import Point from "../common/Point";

export
class Model {
  gl: WebGLRenderingContext;
  buffer: WebGLBuffer;

  constructor(public shader: Shader, public vertices: [Point, Point][]) {
    const gl = this.gl = shader.gl;
    this.buffer = gl.createBuffer();
  }

  updateBuffer() {
    const values = this.vertices.map(([xy, uv]) => [xy.x, xy.y, uv.x, uv.y])
      .reduce((a, b) => a.concat(b), []);
    const data = new Float32Array(values);
    const gl = this.gl;
    gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
    gl.bufferData(gl.ARRAY_BUFFER, data, gl.STREAM_DRAW);
  }
}
