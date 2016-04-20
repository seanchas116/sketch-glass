import * as _ from 'lodash';
import Color from '../lib/geometry/Color';
import Vec2 from '../lib/geometry/Vec2';
import Rect from '../lib/geometry/Rect';
import Curve from "../lib/geometry/Curve";
import Transform from '../lib/geometry/Transform';
import Stroke from '../model/Stroke';
import Background from "../lib/geometry/Background";
import FillShader from "./FillShader";
import Model from "./Model";
import Shader from "./Shader";
import Canvas from "../model/Canvas";
import TreeDisposable from "../lib/TreeDisposable";
import Tool from "../model/Tool";

function addSegment(model: Model, width: number, last: Vec2, point: Vec2) {
  const vertices = model.vertices;

  const normal = point.sub(last).normalize().rotate90();
  const toLeft = normal.mul(width / 2);
  const toRight = normal.mul(-width / 2);
  vertices.push([last.add(toLeft), new Vec2(-1, 0)]);
  vertices.push([last.add(toRight), new Vec2(1, 0)]);
  vertices.push([point.add(toLeft), new Vec2(-1, 0)]);
  vertices.push([point.add(toRight), new Vec2(1, 0)]);
}

function addSegments(model: Model, width: number, vertices: Vec2[]) {
  for (let i = 0; i < vertices.length - 1; ++i) {
    addSegment(model, width, vertices[i], vertices[i+1]);
  }
}

export default
class Renderer extends TreeDisposable {
  strokeModelMap = new Map<Stroke, Model>();
  strokeFinalizedModel: Model;
  strokePrecedingModel: Model;
  stroke: Stroke | null;
  isUpdateQueued = false;
  devicePixelRatio = 1;
  size = new Vec2(0, 0);
  background: Background;
  gl: WebGLRenderingContext;
  viewportTransform: Transform;
  shader: FillShader;
  backgroundModel: Model;
  backgroundShader: Shader;

  constructor(public element: HTMLCanvasElement, public canvas: Canvas) {
    super();
    this.background = new Background(Color.white);

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
      [new Vec2(-1, -1), new Vec2(0, 0)],
      [new Vec2(-1, 1), new Vec2(0, 0)],
      [new Vec2(1, -1), new Vec2(0, 0)],
      [new Vec2(1, 1), new Vec2(0, 0)],
    ]);
    this.backgroundModel.updateBuffer();

    gl.clearColor(0, 0, 0, 0);

    window.addEventListener('resize', this.onResize.bind(this));
    this.onResize();

    this.strokeFinalizedModel = new Model(gl, []);
    this.strokePrecedingModel = new Model(gl, []);
  }

  dispose() {
    super.dispose();
    for (const model of this.strokeModelMap.values()) {
      model.dispose();
    }
    if (this.strokePrecedingModel) {
      this.strokePrecedingModel.dispose();
    }
  }

  strokeBegin() {
    const stroke = this.stroke = new Stroke();
    if (this.canvas.toolBox.tool.value == Tool.Pen) {
      stroke.width = this.canvas.toolBox.penWidth.value;
      stroke.color = this.canvas.toolBox.color.value;
    } else {
      stroke.width = this.canvas.toolBox.eraserWidth.value;
      stroke.color = new Color(255,255,255,1);
    }
    this.strokeFinalizedModel = new Model(this.gl, []);
    this.strokePrecedingModel = new Model(this.gl, []);
  }

  strokeNext(pos: Vec2, timeStamp: number) {
    console.log(`timeStamp: ${timeStamp}`);

    this.stroke.points.push(pos);
    const {points, width} = this.stroke;
    const nPoints = points.length;
    const finalizedModel = this.strokeFinalizedModel;
    const precedingModel = this.strokePrecedingModel;
    precedingModel.vertices = [];

    let lastVertices: Vec2[];
    let currVertices: Vec2[];

    if (nPoints === 2) {
      lastVertices = [];
      currVertices = points;
    } else if (nPoints === 3) {
      lastVertices = Curve.bSpline(points[0], points[0], points[1], points[2]).subdivide();
      currVertices = Curve.bSpline(points[0], points[1], points[2], points[2]).subdivide();
    } else if (nPoints > 3) {
      lastVertices = Curve.bSpline(points[nPoints - 4], points[nPoints - 3], points[nPoints - 2], points[nPoints - 1]).subdivide();
      currVertices = Curve.bSpline(points[nPoints - 3], points[nPoints - 2], points[nPoints - 1], points[nPoints - 1]).subdivide();
    }

    addSegments(finalizedModel, width, lastVertices);
    addSegments(precedingModel, width, currVertices);

    finalizedModel.updateBuffer();
    precedingModel.updateBuffer();
    this.render();
  }

  strokeEnd() {
    const model = new Model(this.gl, this.strokeFinalizedModel.vertices.concat(this.strokePrecedingModel.vertices));
    this.strokeFinalizedModel.vertices = [];
    this.strokePrecedingModel.vertices = [];

    model.updateBuffer();
    this.strokeFinalizedModel.updateBuffer();
    this.strokePrecedingModel.updateBuffer();

    this.strokeModelMap.set(this.stroke, model);
    this.canvas.strokes.push(this.stroke);

    this.stroke = null;
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

    const transform = this.canvas.transform.value;

    shader.use();
    shader.setTransforms(this.viewportTransform, transform);

    const draw = (stroke: Stroke, model: Model) => {
      if (model.vertices.length > 0) {
        shader.setColor(stroke.color);
        shader.setDisplayWidth(stroke.width * transform.m11);
        model.draw(shader);
      }
    };

    for (const [stroke, model] of this.strokeModelMap) {
      draw(stroke, model);
    }
    if (this.stroke) {
      draw(this.stroke, this.strokeFinalizedModel);
      draw(this.stroke, this.strokePrecedingModel);
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
