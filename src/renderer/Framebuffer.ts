import Vec2 from "../lib/geometry/Vec2";
import Texture from "./Texture";

export default
class Framebuffer {
  framebuffer: WebGLFramebuffer;
  texture: Texture;

  constructor(public gl: WebGLRenderingContext) {
    this.framebuffer = gl.createFramebuffer();
    this.texture = new Texture(gl)
  }

  resize(size: Vec2) {
    const {gl} = this;
    this.texture.resize(size);
    this.using(() => {
      gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, this.texture.texture, 0);
    });
  }

  using(f: () => void) {
    const {gl} = this;
    gl.bindFramebuffer(gl.FRAMEBUFFER, this.framebuffer);
    f();
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
  }
}
