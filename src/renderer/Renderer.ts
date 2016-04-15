import * as _ from 'lodash';
import Color from '../lib/geometry/Color';
import Point from '../lib/geometry/Point';
import Rect from '../lib/geometry/Rect';
import Transform from '../lib/geometry/Transform';
import Stroke from '../model/Stroke';
import Background from "../lib/geometry/Background";
import FillShader from "./FillShader";
import StrokeWeaver from "./StrokeWeaver";
import Model from "./Model";
import Shader from "./Shader";
import Canvas from "../model/Canvas";
import DisposableBag from "../lib/DisposableBag";

export default
class Renderer {

  element = document.createElement('canvas');
  strokeWeavers: StrokeWeaver[] = [];
  isUpdateQueued = false;
  devicePixelRatio = 1;
  width = 0;
  height = 0;
  background: Background;
  transform = Transform.identity();
  gl: WebGLRenderingContext;
  viewportTransform: Transform;
  shader: FillShader;
  backgroundModel: Model;
  backgroundShader: Shader;
  disposables = new DisposableBag();

  constructor(viewModel: Canvas) {
    this.disposables.add(
      viewModel.strokeAdded.forEach(stroke => this.addStroke(stroke)),
      viewModel.updateNeeded.forEach(() => this.update()),
      viewModel.transform.changed.forEach(t => this.transform = t)
    );

    this.background = new Background(new Color(255,255,255,1));

    // TODO: check why explicit cast is required
    const glOpts = {
      alpha: false,
      antialias: false,
      depth: false,
      premultipliedAlpha: true
    };
    const gl = this.gl = <WebGLRenderingContext>(
      this.element.getContext("webgl", glOpts) || this.element.getContext("experimental-webgl", glOpts)
    );
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);

    this.shader = new FillShader(gl);

    this.backgroundShader = new Shader(gl);
    this.backgroundShader.setColor(this.background.color);

    this.backgroundModel = new Model(gl, [
      [new Point(-1, -1), new Point(0, 0)],
      [new Point(-1, 1), new Point(0, 0)],
      [new Point(1, -1), new Point(0, 0)],
      [new Point(1, 1), new Point(0, 0)],
    ]);
    this.backgroundModel.updateBuffer();

    gl.clearColor(0, 0, 0, 0);

    this.element.className = 'renderer';
    window.addEventListener('resize', this.onResize.bind(this));
    this.onResize();
  }

  dispose() {
    this.disposables.dispose();
  }

  addStroke(stroke: Stroke) {
    this.strokeWeavers.push(new StrokeWeaver(this.gl, stroke));
  }

  update(immediate = false) {
    if (!this.isUpdateQueued) {
      this.isUpdateQueued = true;
      const callback = () => {
        this.render();
        this.isUpdateQueued = false;
      };
      if (immediate) {
        setImmediate(callback);
      } else {
        requestAnimationFrame(callback);
      }
    }
  }

  renderBackground() {
    const gl = this.gl;
    const shader = this.backgroundShader;
    const model = this.backgroundModel;

    shader.use();
    shader.setTransforms(Transform.identity(), Transform.identity());
    model.draw(shader);
  }

  render() {
    const gl = this.gl;
    const shader = this.shader;
    gl.clear(gl.COLOR_BUFFER_BIT);

    this.renderBackground();

    shader.use();
    shader.setTransforms(this.viewportTransform, this.transform);

    this.strokeWeavers.forEach((weaver) => {
      const stroke = weaver.stroke;
      const model = weaver.model;
      shader.setColor(stroke.color);
      shader.setDisplayWidth(stroke.width * this.transform.m11);
      model.draw(shader);
    });
  }

  onResize() {
    const width = this.width = window.innerWidth;
    const height = this.height = window.innerHeight;
    const dpr = this.devicePixelRatio = window.devicePixelRatio || 1;

    this.viewportTransform = Transform.scale(2 / width, 2 / height)
      .translate(new Point(-1, -1))
      .scale(1, -1);
    this.element.width = width * dpr;
    this.element.height = height * dpr;

    this.gl.viewport(0, 0, width * dpr, height * dpr);

    console.log(`resized to ${width} * ${height}, pixel ratio ${devicePixelRatio}`);

    this.update();
  }
}
