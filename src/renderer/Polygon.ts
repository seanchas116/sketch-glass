import Shader from "./Shader";
import Vec2 from "../lib/geometry/Vec2";

export default
class Polygon {
    buffer: WebGLBuffer;
    vertexArray: any;
    vertexArrayExt = this.gl.getExtension('OES_vertex_array_object');

    constructor(public gl: WebGLRenderingContext, public shader: Shader, public vertices: [Vec2, number][]) {
        this.buffer = gl.createBuffer() !;
        const ext = this.vertexArrayExt;
        if (ext != null) {
            this.vertexArray = ext.createVertexArrayOES();
            ext.bindVertexArrayOES(this.vertexArray);

            shader.use();
            gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
            gl.enableVertexAttribArray(this.shader.aPosition);
            gl.enableVertexAttribArray(this.shader.aAAOffset);
            gl.vertexAttribPointer(this.shader.aPosition, 2, gl.FLOAT, false, 12, 0);
            gl.vertexAttribPointer(this.shader.aAAOffset, 1, gl.FLOAT, false, 12, 8);

            ext.bindVertexArrayOES(null);
        }
    }

    updateBuffer(staticDraw: boolean) {
        const data = new Float32Array(this.vertices.length * 3);
        for (let i = 0; i < this.vertices.length; ++i) {
            const [xy, t] = this.vertices[i];
            data.set([xy.x, xy.y, t], i * 3);
        }
        const gl = this.gl;
        gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
        gl.bufferData(gl.ARRAY_BUFFER, data, staticDraw ? gl.STATIC_DRAW : gl.STREAM_DRAW);
    }

    draw() {
        const gl = this.gl;
        this.shader.use();
        if (this.vertexArray) {
            this.vertexArrayExt.bindVertexArrayOES(this.vertexArray);
        } else {
            gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
            gl.vertexAttribPointer(this.shader.aPosition, 2, gl.FLOAT, false, 12, 0);
            gl.vertexAttribPointer(this.shader.aAAOffset, 1, gl.FLOAT, false, 12, 8);
        }
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, this.vertices.length);
    }

    dispose() {
        this.gl.deleteBuffer(this.buffer);
    }
}
