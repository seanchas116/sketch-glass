import Vec2 from "../lib/geometry/Vec2";

export default
class Framebuffer {
  framebuffer: WebGLFramebuffer;
  renderbuffer: WebGLRenderbuffer;

  constructor(public gl: WebGLRenderingContext, public size: Vec2) {
    this.framebuffer = gl.createFramebuffer()!;
    this.renderbuffer = gl.createRenderbuffer()!;
    this.resize(size);
  }

  resize(size: Vec2) {
    const {gl} = this;
    gl.bindRenderbuffer(gl.RENDERBUFFER, this.renderbuffer);
    gl.renderbufferStorage(gl.RENDERBUFFER, gl.RGBA4, size.width, size.height);
    this.using(() => {
      gl.viewport(0, 0, size.width, size.height);
      gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.RENDERBUFFER, this.renderbuffer);
    });
    this.size = size;
  }

  using(f: () => void) {
    const {gl} = this;
    gl.bindFramebuffer(gl.FRAMEBUFFER, this.framebuffer);
    f();
    gl.bindFramebuffer(gl.FRAMEBUFFER, null as any);
  }

  readPixels() {
    const {gl} = this;
    const {width, height} = this.size;
    const data = new Uint8Array(width * height * 4);
    this.using(() => {
      gl.readPixels(0, 0, width, height, gl.RGBA, gl.UNSIGNED_BYTE, data);
    });
    return data;
  }
}
