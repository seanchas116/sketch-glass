import Vec2 from "../lib/geometry/Vec2";

export default
class Texture {
  texture: WebGLTexture;
  size = new Vec2(0, 0);

  constructor(public gl: WebGLRenderingContext) {
    this.texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, this.texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  }

  resize(size: Vec2) {
    this.use();
    const {gl} = this;
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, size.width, size.height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
    this.size = size;
  }

  use() {
    const {gl} = this;
    gl.bindTexture(gl.TEXTURE_2D, this.texture);
  }

  activate(index: number) {
    const {gl} = this;
    gl.activeTexture(gl.TEXTURE0 + index);
  }
}
