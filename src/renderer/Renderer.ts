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
import ThumbnailUpdater from "./ThumbnailUpdater";
import Model from "./Model";
import * as Rx from "rx";
const platform = require("platform");

export default
    class Renderer extends ObservableDestination {
    strokes = new Variable<Stroke[]>([]);
    strokeModels = new Variable<StrokeModel[]>([]);
    visibleStrokeModels = new Variable<StrokeModel[]>([]);
    currentModel: StrokeModel | undefined;
    erasingWidth: number;
    erasingPoints: Vec2[] = [];
    isUpdateQueued = false;
    devicePixelRatio = 1;
    size = new Variable(Vec2.zero);
    background: Background;
    gl: WebGLRenderingContext;
    transform = new Variable(Transform.identity);
    viewportTransform = Transform.identity;
    shader: StrokeShader;
    backgroundModel: BackgroundModel;
    boundingRect = Rect.empty;
    thumbnailUpdater: ThumbnailUpdater;
     // In iOS flickers occur when preserveDrawingBuffer: true
    preserveDrawingBufferSupported = platform.os.family != "iOS";

    canvas = new Variable<Canvas | undefined>(undefined);

    constructor(public element: HTMLCanvasElement) {
        super();
        this.initGL();
        const {gl} = this;

        this.background = new Background(Color.white);

        this.shader = new StrokeShader(gl);

        this.backgroundModel = new BackgroundModel(gl, this.shader);

        this.subscribe(this.strokeModels.changed, models => {
            this.boundingRect = models.reduce((a, x) => a.union(x.boundingRect), Rect.empty);
        });

        this.subscribeWithDestination(this.canvas.changed, (canvas, destination) => {
            if (canvas != undefined) {
                destination.subscribe(canvas.strokes.changed, this.strokes);
                destination.subscribe(canvas.editedInRemote, () => this.update());
            } else {
                this.strokes.value = [];
            }
            this.update();
        });

        this.subscribeArrayWithTracking(this.strokes.changed, this.strokeModels, {
            getKey: stroke => stroke.id,
            create: stroke => StrokeModel.fromStroke(gl, this.shader, stroke)
        });

        this.subscribe(
            Rx.Observable.combineLatest(
                this.strokeModels.changed,
                this.size.changed,
                this.transform.changed,
                (models, size, transform) => {
                    const sceneRect = new Rect(Vec2.zero, this.size.value).transform(this.transform.value.invert());
                    return models.filter(m => !m.boundingRect.intersection(sceneRect).isEmpty);
                }
            ), this.visibleStrokeModels
        )

        this.thumbnailUpdater = new ThumbnailUpdater(this);

        window.addEventListener('resize', this.onResize.bind(this));
        this.onResize();
    }

    private initGL() {
        const glOpts = {
            preserveDrawingBuffer: this.preserveDrawingBufferSupported,
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
        gl.clearColor(1, 1, 1, 1);
        if (this.preserveDrawingBufferSupported) {
            gl.enable(gl.SCISSOR_TEST);
        }
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
        this.currentModel = new StrokeModel(this.gl, this.shader, color, width);
    }

    strokeNext(pos: Vec2) {
        if (this.currentModel == undefined) {
            return;
        }
        const rect = this.currentModel.addPoint(pos);
        this.render(rect);
    }

    strokeEnd() {
        if (this.currentModel == undefined) {
            return;
        }
        const canvas = this.canvas.value;
        if (canvas == undefined) {
            return;
        }
        canvas.pushStroke(this.currentModel.toStroke());
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
        const boundingRect = Rect.boundingRect(vertices);
        const collider = new StrokeCollider(this.erasingWidth, vertices);
        const modelsToErase: StrokeModel[] = [];
        for (const model of this.strokeModels.value) {
            if (boundingRect.intersection(model.boundingRect).isEmpty) {
                continue;
            }
            if (model.collider.collides(collider)) {
                modelsToErase.push(model);
            }
        }
        if (modelsToErase.length > 0) {
            for (const model of modelsToErase) {
                canvas.deleteStroke(model.id);
            }
            this.render();
        }
    }

    eraseEnd() {
    }

    update() {
        if (!this.isUpdateQueued) {
            this.isUpdateQueued = true;
            const callback = () => {
                this.render();
                this.isUpdateQueued = false;
            };
            requestAnimationFrame(callback);
        }
    }

    render(rect?: Rect) {
        if (!this.preserveDrawingBufferSupported) {
            rect = undefined;
        }
        const scene = new Scene(this.gl);
        scene.devicePixelRatio = this.devicePixelRatio;
        scene.size = this.size.value;
        scene.transform = this.transform.value;

        let models: Model[];

        if (rect) {
            models = this.visibleStrokeModels.value.filter(m => !m.boundingRect.intersection(rect!).isEmpty);
            models.unshift(this.backgroundModel);
        } else {
            models = Array.from(this.visibleStrokeModels.value);
        }
        if (this.currentModel) {
            models.push(this.currentModel);
        }
        scene.models = models;
        if (rect) {
            scene.region = rect;
        }
        scene.render();
    }

    onResize() {
        const {width, height} = this.size.value = new Vec2(window.innerWidth, window.innerHeight);
        const dpr = this.devicePixelRatio = window.devicePixelRatio || 1;
        const {gl} = this;

        this.element.width = width * dpr;
        this.element.height = height * dpr;
        this.element.style.transform = `scale(${1 / dpr})`;

        gl.viewport(0, 0, width * dpr, height * dpr);
        gl.scissor(0, 0, width * dpr, height * dpr);
        gl.clear(gl.COLOR_BUFFER_BIT);

        console.log(`resized to ${width} * ${height}, pixel ratio ${devicePixelRatio}`);

        this.update();
    }
}
