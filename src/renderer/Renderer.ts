import Color from '../lib/geometry/Color';
import Vec2 from '../lib/geometry/Vec2';
import Curve from "../lib/geometry/Curve";
import Transform from '../lib/geometry/Transform';
import Stroke from '../model/Stroke';
import Background from "../lib/geometry/Background";
import StrokeShader from "./StrokeShader";
import Polygon from "./Polygon";
import Shader from "./Shader";
import Canvas from "../model/Canvas";
import StrokeModel from "./StrokeModel";
import BackgroundModel from "./BackgroundModel";
import StrokeCollider from "./StrokeCollider";
import Variable from "../lib/rx/Variable";
import AutoDisposeArray from "../lib/rx/AutoDisposeArray";
import ObservableDestination from "../lib/rx/ObservableDestination";

export default
class Renderer extends ObservableDestination {
  strokeModels = new AutoDisposeArray<StrokeModel>();
  currentModel: StrokeModel | undefined;
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
  backgroundModel: BackgroundModel;

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

    const backgroundShader = new Shader(gl);
    backgroundShader.setColor(this.background.color);
    this.backgroundModel = new BackgroundModel(gl, backgroundShader);

    gl.clearColor(0, 0, 0, 0);

    window.addEventListener('resize', this.onResize.bind(this));
    this.onResize();

    this.disposables.add(this.strokeModels);
    this.subscribe(this.strokeModels.spliced, () => this.render());
    this.subscribeWithDestination(this.canvas.changed, (canvas, destination) => {
      if (canvas != undefined) {
        destination.disposables.add(
          canvas.strokes.bindToOther(this.strokeModels, stroke => {
            const model = new StrokeModel(gl, this.shader, stroke);
            model.finalize();
            return model;
          })
        );
      } else {
        this.strokeModels.values = [];
      }
    });
  }

  dispose() {
    super.dispose();
    if (this.currentModel) {
      this.currentModel.dispose();
    }
  }

  strokeBegin(width: number, color: Color) {
    const stroke = new Stroke([], color, width);
    this.currentModel = new StrokeModel(this.gl, this.shader, stroke);
  }

  strokeNext(pos: Vec2) {
    if (this.currentModel == undefined) {
      return;
    }
    this.currentModel.addPoint(pos);
    this.render();
  }

  strokeEnd() {
    if (this.currentModel == undefined) {
      return;
    }
    const canvas = this.canvas.value;
    if (canvas == undefined) {
      return;
    }
    canvas.pushStroke(this.currentModel.stroke);
    this.currentModel.dispose();
    this.currentModel = undefined;
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
    for (const model of this.strokeModels.values) {
      if (model.collider.collides(collider)) {
        strokeToErase.push(model.stroke);
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

  render() {
    const {viewportTransform, transform} = this;

    this.backgroundModel.render(this.viewportTransform, this.transform);

    for (const model of this.strokeModels.values) {
      model.render(viewportTransform, transform);
    }
    if (this.currentModel) {
      this.currentModel.render(viewportTransform, transform);
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
