import Color from '../lib/geometry/Color';
import Vec2 from '../lib/geometry/Vec2';
import Rect from '../lib/geometry/Rect';
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
import ObservableDestination from "../lib/rx/ObservableDestination";
import Scene from "./Scene";
import Framebuffer from "./Framebuffer";
import dataToJpeg from "../lib/dataToJpeg";
import CanvasFile from "../model/CanvasFile";
import ThumbnailUpdater from "./ThumbnailUpdater";

export default
class Renderer extends ObservableDestination {
  strokes = new Variable<Stroke[]>([]);
  strokeModels = new Variable<StrokeModel[]>([]);
  currentModel: StrokeModel | undefined;
  erasingWidth: number;
  erasingPoints: Vec2[] = [];
  isUpdateQueued = false;
  devicePixelRatio = 1;
  size = Vec2.origin;
  background: Background;
  gl: WebGLRenderingContext;
  transform = Transform.identity();
  viewportTransform = Transform.identity();
  shader: StrokeShader;
  backgroundModel: BackgroundModel;
  boundingRect = Rect.empty;
  thumbnailUpdater: ThumbnailUpdater;

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

    this.subscribe(this.strokeModels.changed, () => this.render());
    this.subscribe(this.strokeModels.changed, models => {
      this.boundingRect = models.reduce((a, x) => a.union(x.boundingRect), Rect.empty);
    });

    this.subscribeWithDestination(this.canvas.changed, (canvas, destination) => {
      if (canvas != undefined) {
        destination.subscribe(canvas.strokes.changed, this.strokes);
      } else {
        this.strokes.value = [];
      }
    });

    this.subscribeArrayWithTracking(this.strokes.changed, this.strokeModels, {
      getKey: stroke => stroke.id,
      create: stroke => {
        const model = new StrokeModel(gl, this.shader, stroke);
        model.finalize();
        return model;
      }
    });

    this.thumbnailUpdater = new ThumbnailUpdater(this);
  }

  dispose() {
    if (!this.isDisposed) {
      if (this.currentModel) {
        this.currentModel.dispose();
      }
      for (const model of this.strokeModels.value) {
        model.dispose();
      }
    }
    this.thumbnailUpdater.dispose();
    super.dispose();
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
    this.thumbnailUpdater.update();
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
    for (const model of this.strokeModels.value) {
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

  models() {
    const models = [this.backgroundModel, ...this.strokeModels.value];
    if (this.currentModel) {
      models.push(this.currentModel);
    }

    return models;
  }

  render() {
    const scene = new Scene(this.gl);
    scene.devicePixelRatio = this.devicePixelRatio;
    scene.size = this.size;
    scene.transform = this.transform;
    scene.models = this.models();
    scene.render();
  }

  onResize() {
    const {width, height} = this.size = new Vec2(window.innerWidth, window.innerHeight);
    const dpr = this.devicePixelRatio = window.devicePixelRatio || 1;

    this.element.width = width * dpr;
    this.element.height = height * dpr;
    this.element.style.transform = `scale(${1 / dpr})`;

    console.log(`resized to ${width} * ${height}, pixel ratio ${devicePixelRatio}`);

    this.update();
  }
}
