import * as _ from 'lodash';
import Color from '../lib/geometry/Color';
import Vec2 from '../lib/geometry/Vec2';
import Rect from '../lib/geometry/Rect';
import Curve from "../lib/geometry/Curve";
import Transform from '../lib/geometry/Transform';
import Stroke from '../model/Stroke';
import Background from "../lib/geometry/Background";
import StrokeShader from "./StrokeShader";
import Model from "./Model";
import Shader from "./Shader";
import Canvas from "../model/Canvas";
import TreeDisposable from "../lib/TreeDisposable";
import Tool from "../model/Tool";
import StrokeWeaver from "./StrokeWeaver";

export default
class Renderer extends TreeDisposable {
  strokeWeaverMap = new Map<Stroke, StrokeWeaver>();
  currentStrokeWeaver: StrokeWeaver;
  currentStroke: Stroke | null;
  isUpdateQueued = false;
  devicePixelRatio = 1;
  size = new Vec2(0, 0);
  background: Background;
  gl: WebGLRenderingContext;
  transform: Transform;
  viewportTransform: Transform;
  shader: StrokeShader;
  backgroundModel: Model;
  backgroundShader: Shader;

  constructor(public element: HTMLCanvasElement, public canvas: Canvas) {
    super();

    this.disposables.add(
      canvas.transform.changed.subscribe(t => this.transform = t)
    );

    this.background = new Background(Color.white);

    // TODO: check why explicit cast is required
    const glOpts = {
      alpha: false,
      depth: false,
      stencil: false,
      antialias: false,
      premultipliedAlpha: true,
    };
    const gl = this.gl = <WebGLRenderingContext>(
      this.element.getContext("webgl", glOpts) || this.element.getContext("experimental-webgl", glOpts)
    );
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);

    this.shader = new StrokeShader(gl);

    this.backgroundShader = new Shader(gl);
    this.backgroundShader.setColor(this.background.color);

    this.backgroundModel = new Model(gl, [
      [new Vec2(-1, -1), new Vec2(0, 0)],
      [new Vec2(-1, 1), new Vec2(0, 0)],
      [new Vec2(1, -1), new Vec2(0, 0)],
      [new Vec2(1, 1), new Vec2(0, 0)],
    ]);
    this.backgroundModel.updateBuffer();

    gl.clearColor(0, 0, 0, 0);

    window.addEventListener('resize', this.onResize.bind(this));
    this.onResize();
  }

  dispose() {
    super.dispose();
    for (const weaver of this.strokeWeaverMap.values()) {
      weaver.dispose();
    }
    if (this.currentStrokeWeaver) {
      this.currentStrokeWeaver.dispose();
    }
  }

  strokeBegin() {
    const stroke = this.currentStroke = new Stroke();
    if (this.canvas.toolBox.tool.value == Tool.Pen) {
      stroke.width = this.canvas.toolBox.penWidth.value;
      stroke.color = this.canvas.toolBox.color.value;
    } else {
      stroke.width = this.canvas.toolBox.eraserWidth.value;
      stroke.color = new Color(255,255,255,1);
    }
    this.currentStrokeWeaver = new StrokeWeaver(this.gl, stroke);
  }

  strokeNext(pos: Vec2) {
    this.currentStroke.points.push(pos);
    const {points, width} = this.currentStroke;
    const nPoints = points.length;
    const weaver = this.currentStrokeWeaver;

    if (nPoints === 2) {
      weaver.addSection(points);
    } else if (nPoints === 3) {
      weaver.rewindLastSection();
      weaver.addSection(Curve.bSpline(points[0], points[0], points[1], points[2]).subdivide());
      weaver.addSection(Curve.bSpline(points[0], points[1], points[2], points[2]).subdivide());
    } else if (nPoints > 3) {
      weaver.rewindLastSection();
      weaver.addSection(Curve.bSpline(points[nPoints - 4], points[nPoints - 3], points[nPoints - 2], points[nPoints - 1]).subdivide());
      weaver.addSection(Curve.bSpline(points[nPoints - 3], points[nPoints - 2], points[nPoints - 1], points[nPoints - 1]).subdivide());
    } else {
      return;
    }
    weaver.model.updateBuffer();
    this.render();
  }

  strokeEnd() {
    this.strokeWeaverMap.set(this.currentStroke, this.currentStrokeWeaver);
    this.canvas.strokes.push(this.currentStroke);

    this.currentStroke = null;
    this.currentStrokeWeaver = null;
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

    const {transform} = this;

    shader.use();
    shader.setTransforms(this.viewportTransform, transform);

    const draw = ({model, stroke}: StrokeWeaver) => {
      if (model.vertices.length > 0) {
        shader.setColor(stroke.color);
        shader.setDisplayWidth(stroke.width * transform.m11);
        model.draw(shader);
      }
    };

    for (const weaver of this.strokeWeaverMap.values()) {
      draw(weaver);
    }
    if (this.currentStrokeWeaver) {
      draw(this.currentStrokeWeaver);
    }
  }

  onResize() {
    const {width, height} = this.size = new Vec2(window.innerWidth, window.innerHeight);
    const dpr = this.devicePixelRatio = window.devicePixelRatio || 1;

    this.viewportTransform = Transform.scale(new Vec2(2 / width, 2 / height))
      .translate(new Vec2(-1, -1))
      .scale(new Vec2(1, -1));
    this.element.width = width * dpr;
    this.element.height = height * dpr;
    this.element.style.transform = `scale(${1 / dpr})`;

    this.gl.viewport(0, 0, width * dpr, height * dpr);

    console.log(`resized to ${width} * ${height}, pixel ratio ${devicePixelRatio}`);

    this.update();
  }
}
