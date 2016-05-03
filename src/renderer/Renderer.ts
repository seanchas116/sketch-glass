import Color from '../lib/geometry/Color';
import Vec2 from '../lib/geometry/Vec2';
import Curve from "../lib/geometry/Curve";
import Transform from '../lib/geometry/Transform';
import Stroke from '../model/Stroke';
import Background from "../lib/geometry/Background";
import StrokeShader from "./StrokeShader";
import Model from "./Model";
import Shader from "./Shader";
import Canvas from "../model/Canvas";
import TreeDisposable from "../lib/TreeDisposable";
import StrokeWeaver from "./StrokeWeaver";
import StrokeCollider from "./StrokeCollider";
import Variable from "../lib/rx/Variable";
import AutoDisposeArray from "../lib/rx/AutoDisposeArray";
import DisposableBag from "../lib/DisposableBag";

export default
class Renderer extends TreeDisposable {
  strokeWeavers = new AutoDisposeArray<StrokeWeaver>();
  currentWeaver: StrokeWeaver | undefined;
  erasingWidth: number;
  erasingPoints: Vec2[] = [];
  isUpdateQueued = false;
  devicePixelRatio = 1;
  size = new Vec2(0, 0);
  background: Background;
  gl: WebGLRenderingContext;
  transform = Transform.identity();
  viewportTransform = Transform.identity();
  shader: StrokeShader;
  backgroundModel: Model;
  backgroundShader: Shader;

  canvasDisposables = new DisposableBag();
  canvas = new Variable<Canvas | undefined>(undefined);

  constructor(public element: HTMLCanvasElement) {
    super();

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

    this.disposables.add(
      this.strokeWeavers,
      this.strokeWeavers.changed.subscribe(() => {
        this.render();
      })
    );

    this.canvas.changed.subscribe(canvas => {
      this.canvasDisposables.clear();
      if (canvas != undefined) {
        this.canvasDisposables.add(
          canvas.strokes.bindToOther(this.strokeWeavers, stroke => {
            const weaver = new StrokeWeaver(gl, stroke);
            weaver.finalize();
            return weaver;
          })
        );
      } else {
        this.strokeWeavers.values = [];
      }
    });
  }

  dispose() {
    super.dispose();
    if (this.currentWeaver) {
      this.currentWeaver.dispose();
    }
  }

  strokeBegin(width: number, color: Color) {
    const stroke = new Stroke([], color, width);
    this.currentWeaver = new StrokeWeaver(this.gl, stroke);
  }

  strokeNext(pos: Vec2) {
    if (this.currentWeaver == undefined) {
      return;
    }
    this.currentWeaver.addPoint(pos);
    this.render();
  }

  strokeEnd() {
    if (this.currentWeaver == undefined) {
      return;
    }
    const canvas = this.canvas.value;
    if (canvas == undefined) {
      return;
    }
    canvas.pushStroke(this.currentWeaver.stroke);
    this.currentWeaver.dispose();
    this.currentWeaver = undefined;
  }

  eraseBegin(width: number) {
    this.erasingWidth = width;
    this.erasingPoints = [];
  }

  eraseNext(pos: Vec2) {
    const canvas = this.canvas.value;
    if (canvas == undefined) {
      return;
    }

    const points = this.erasingPoints;
    points.push(pos);
    const nPoints = points.length;
    if (nPoints <= 3) {
      return;
    }
    const vertices = Curve.bSpline(points[nPoints - 4], points[nPoints - 3], points[nPoints - 2], points[nPoints - 1]).subdivide();
    const collider = new StrokeCollider(this.erasingWidth, vertices);
    const strokeToErase: Stroke[] = [];
    for (const weaver of this.strokeWeavers.values) {
      if (weaver.collider.collides(collider)) {
        strokeToErase.push(weaver.stroke);
      }
    }
    if (strokeToErase.length > 0) {
      for (const stroke of strokeToErase) {
        canvas.deleteStroke(stroke);
      }
      this.render();
    }
  }

  eraseEnd() {
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

    for (const weaver of this.strokeWeavers.values) {
      draw(weaver);
    }
    if (this.currentWeaver) {
      draw(this.currentWeaver);
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
