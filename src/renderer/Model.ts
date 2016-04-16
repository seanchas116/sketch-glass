import Shader from "./Shader";
import Vec2 from "../lib/geometry/Vec2";

export default
class Model {
  buffer: WebGLBuffer;

  constructor(public gl: WebGLRenderingContext, public vertices: [Vec2, Vec2][]) {
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

  draw(shader: Shader) {
    const gl = this.gl;

    gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
    gl.vertexAttribPointer(shader.aPosition, 2, gl.FLOAT, false, 16, 0);
    gl.vertexAttribPointer(shader.aUVCoord, 2, gl.FLOAT, false, 16, 8);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, this.vertices.length);
  }
}
