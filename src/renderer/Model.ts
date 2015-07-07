import Shader from "./Shader";
import Point from "../common/Point";

export default
class Model {
  buffer: WebGLBuffer;

  constructor(public gl: WebGLRenderingContext, public vertices: [Point, Point][]) {
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
