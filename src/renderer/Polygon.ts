import Shader from "./Shader";
import Vec2 from "../lib/geometry/Vec2";

export default
class Polygon {
    buffer: WebGLBuffer;

    constructor(public gl: WebGLRenderingContext, public shader: Shader, public vertices: [Vec2, Vec2][]) {
        this.buffer = gl.createBuffer() !;
    }

    updateBuffer() {
        const data = new Float32Array(this.vertices.length * 4);
        for (let i = 0; i < this.vertices.length; ++i) {
            const [xy, uv] = this.vertices[i];
            data.set([xy.x, xy.y, uv.x, uv.y], i * 4);
        }
        const gl = this.gl;
        gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
        gl.bufferData(gl.ARRAY_BUFFER, data, gl.STREAM_DRAW);
    }

    draw() {
        const gl = this.gl;
        this.shader.use();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
        gl.vertexAttribPointer(this.shader.aPosition, 2, gl.FLOAT, false, 16, 0);
        gl.vertexAttribPointer(this.shader.aUVCoord, 2, gl.FLOAT, false, 16, 8);
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, this.vertices.length);
    }

    dispose() {
        this.gl.deleteBuffer(this.buffer);
    }
}
