import Vec2 from "../lib/geometry/Vec2";
import Transform from "../lib/geometry/Transform";
import Scene from "./Scene";
import Renderer from "./Renderer";
import Framebuffer from "./Framebuffer";
import ObservableDestination from "../lib/rx/ObservableDestination";
import CanvasFile from "../model/CanvasFile";
import Variable from "../lib/rx/Variable";
import * as Rx from "rx";

const thumbSize = new Vec2(1600, 1200);
const updateInterval = 2000;

function registerTimeout(ms: number, action: () => void) {
    const id = setTimeout(action, ms);
    let isDisposed = false;
    return {
        get isDisposed() {
            return isDisposed;
        },
        dispose: () => {
            clearTimeout(id);
            isDisposed = true;
        }
    };
}

export default
    class ThumbnialUpdater extends ObservableDestination {

    gl = this.renderer.gl;
    framebuffer = new Framebuffer(this.gl, thumbSize);
    canvas = document.createElement("canvas") as HTMLCanvasElement;
    context = this.canvas.getContext("2d");
    imageData = this.context.createImageData(thumbSize.width, thumbSize.height);
    dirty = new Variable(true);
    timeout = new Rx.SerialDisposable();

    constructor(public renderer: Renderer) {
        super();
        this.canvas.width = thumbSize.width;
        this.canvas.height = thumbSize.height;
        this.subscribeWithDestination(renderer.canvas.changed, (canvas, dest) => {
            if (canvas != undefined) {
                dest.subscribe(canvas.editedInLocal, () => {
                    this.timeout.setDisposable(registerTimeout(updateInterval, () => {
                        this.update();
                    }));
                });
            }
        });
    }

    dispose() {
        super.dispose();
        this.timeout.dispose();
    }

    update() {
        console.log("updating thumbnail...");

        const canvas = this.renderer.canvas.value;
        if (canvas == undefined) {
            return;
        }
        const {boundingRect} = this.renderer;
        if (boundingRect.isEmpty) {
            return;
        }

        this.framebuffer.using(() => {
            const scene = new Scene(this.gl);
            scene.size = thumbSize;
            scene.flip = true;

            const scale = Math.min(thumbSize.width / boundingRect.width, thumbSize.height / boundingRect.height);

            scene.transform = Transform.translate(boundingRect.center.negate())
                .scale(new Vec2(scale, scale))
                .translate(thumbSize.mul(0.5));

            const models = [...this.renderer.strokeModels.value];
            if (this.renderer.currentModel) {
                models.push(this.renderer.currentModel);
            }

            scene.models = models;

            scene.render();
        });
        this.framebuffer.readPixels(new Uint8Array(this.imageData.data.buffer));
        this.context.putImageData(this.imageData, 0, 0);
        const jpeg = this.canvas.toDataURL("image/jpeg").replace(/^data:image\/jpeg;base64,/, "");

        CanvasFile.updateThumbnail(canvas.file.id, jpeg);
    }
}
