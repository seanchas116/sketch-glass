import Component from "../lib/ui/Component";
import MountPoint from "../lib/ui/MountPoint";
import Renderer from '../renderer/Renderer';
import Stroke from '../model/Stroke';
import Vec2 from '../lib/geometry/Vec2';
import Transform from '../lib/geometry/Transform';
import Canvas from "../model/Canvas";
import Tool from "../model/Tool";
import Variable from "../lib/rx/Variable";
import AutoDisposeVariable from "../lib/rx/AutoDisposeVariable";
import CanvasViewModel from "../viewmodel/CanvasViewModel";
import {appViewModel} from "../viewmodel/AppViewModel";
import ObservableDestination from "../lib/rx/ObservableDestination";
import * as Rx from "rx";
const Mousetrap = require("mousetrap");

const {toolBoxViewModel} = appViewModel;

class Interaction {
    constructor(public canvasVM: CanvasViewModel, public renderer: Renderer) {
    }

    begin(points: Vec2[], pointerId: number) {
    }

    next(points: Vec2[]) {
    }

    dispose() {
    }

    finish() {
    }

    scenePos(pos: Vec2) {
        return pos.transform(this.canvasVM.transform.value.invert());
    }

    static pointerCount = 1;

    static canInitiate(canvasView: CanvasView, points: Vec2[], events: UIEvent[]) {
        return true;
    }
}

class DrawingInteraction extends Interaction {
    isDisposed = false;

    begin(points: Vec2[], pointerId: number) {
        const pos = this.scenePos(points[0]);
        if (!pos) { return; }
        this.renderer.strokeBegin(toolBoxViewModel.penWidth.value, toolBoxViewModel.color.value);
        this.renderer.strokeNext(pos);
    }

    next(points: Vec2[]) {
        const pos = this.scenePos(points[0]);
        if (!pos) { return; }
        this.renderer.strokeNext(pos);
    }

    finish() {
        this.renderer.strokeEnd();
        this.isDisposed = true;
    }

    static canInitiate(canvasView: CanvasView, points: Vec2[], events: UIEvent[]) {
        return toolBoxViewModel.tool.value == Tool.Pen;
    }
}

class ErasingInteraction extends Interaction {

    begin(points: Vec2[], pointerId: number) {
        const pos = this.scenePos(points[0]);
        this.renderer.eraseBegin(toolBoxViewModel.penWidth.value);
        this.renderer.eraseNext(pos);
    }

    next(points: Vec2[]) {
        const pos = this.scenePos(points[0]);
        this.renderer.eraseNext(pos);
    }

    static canInitiate(canvasView: CanvasView, points: Vec2[], events: UIEvent[]) {
        return toolBoxViewModel.tool.value == Tool.Eraser;
    }
}

class PinchingInteraction extends Interaction {
    startPoints: Vec2[];
    initTransform: Transform;
    transform: Transform;

    begin(points: Vec2[], pointerId: number) {
        this.startPoints = points;
        this.transform = this.initTransform = this.canvasVM.transform.value;
    }

    next(points: Vec2[]) {
        const scale = points[0].sub(points[1]).length / this.startPoints[0].sub(this.startPoints[1]).length;

        const centerStart = this.startPoints[0].add(this.startPoints[1]).mul(0.5);
        const center = points[0].add(points[1]).mul(0.5);

        const diff = center.sub(centerStart.mul(scale));

        let transform = Transform.scale(new Vec2(scale, scale)).merge(Transform.translate(diff));

        this.renderer.transform.value = this.transform = this.initTransform.merge(transform);
        this.renderer.update();
    }

    finish() {
        this.canvasVM.transform.value = this.transform;
    }

    static pointerCount = 2;
}

class DraggingInteraction extends Interaction {

    startPoint: Vec2;
    initTransform: Transform;
    transform: Transform;

    begin(points: Vec2[], pointerId: number) {
        this.startPoint = points[0];
        this.transform = this.initTransform = this.canvasVM.transform.value;
    }

    next(points: Vec2[]) {
        const pos = points[0];
        this.transform = this.renderer.transform.value = this.initTransform.translate(pos.sub(this.startPoint));
        this.renderer.update();
    }

    finish() {
        this.canvasVM.transform.value = this.transform;
    }

    static canInitiate(canvasView: CanvasView, points: Vec2[], events: UIEvent[]) {
        if (canvasView.isDragMode.value) {
            return true;
        }
        const event = events[0];
        if (event instanceof MouseEvent) {
            return event.button == 2;
        } else {
            return false;
        }
    }
}

const interactionClasses: (typeof Interaction)[] = [DraggingInteraction, DrawingInteraction, ErasingInteraction, PinchingInteraction];

export default
class CanvasView extends Component {

    eventPos(ev: { clientX: number, clientY: number }) {
        return new Vec2(ev.clientX, this.renderer.size.value.height - ev.clientY);
    }

    pointers = new Map<number, PointerEvent>();

    private onPointerDown(ev: PointerEvent) {
        this.pointers.set(ev.pointerId, ev);

        const canvasVM = this.canvasViewModel.value;
        if (!canvasVM) { return; }

        const events = Array.from(this.pointers.values());
        const points = events.map(e => this.eventPos(e));

        for (const klass of interactionClasses) {
            if (events.length == klass.pointerCount && klass.canInitiate(this, points, events)) {
                const interaction = new klass(canvasVM, this.renderer);
                interaction.begin(points, ev.pointerId);
                this.interaction.value = interaction;
                return;
            }
        }
    }

    private onPointerMove(ev: PointerEvent) {
        if (!this.pointers.has(ev.pointerId)) {
            return;
        }
        this.pointers.set(ev.pointerId, ev);
        const interaction = this.interaction.value;
        if (interaction) {
            const events = Array.from(this.pointers.values());
            const points = events.map(e => this.eventPos(e));
            interaction.next(points);
        }
    }

    private onPointerUp(ev: PointerEvent) {
        this.pointers.delete(ev.pointerId);
        const interaction = this.interaction.value;
        if (interaction && this.pointers.size < (interaction.constructor as typeof Interaction).pointerCount) {
            interaction.finish();
            this.interaction.value = undefined;
        }
    }

    private onMouseDown(ev: MouseEvent) {
        const canvasVM = this.canvasViewModel.value;
        if (!canvasVM) { return; }
        const point = this.eventPos(ev);

        for (const klass of interactionClasses) {
            if (klass.pointerCount == 1 && klass.canInitiate(this, [point], [ev])) {
                const interaction = new klass(canvasVM, this.renderer);
                interaction.begin([point], 0);
                this.interaction.value = interaction;
                return;
            }
        }
    }

    private onMouseMove(ev: MouseEvent) {
        const interaction = this.interaction.value;
        if (interaction) {
            const point = this.eventPos(ev);
            interaction.next([point]);
        }
    }

    private onMouseUp(ev: MouseEvent) {
        const interaction = this.interaction.value;
        if (interaction) {
            interaction.finish();
            this.interaction.value = undefined;
        }
    }

    private onTouchStart(ev: TouchEvent) {
        const canvasVM = this.canvasViewModel.value;
        if (!canvasVM) { return; }
        const points = Array.from(ev.touches).map(t => this.eventPos(t));

        for (const klass of interactionClasses) {
            if (klass.pointerCount == ev.touches.length && klass.canInitiate(this, points, [ev])) {
                const interaction = new klass(canvasVM, this.renderer);
                interaction.begin(points, 0);
                this.interaction.value = interaction;
                return;
            }
        }
        ev.preventDefault();
    }

    private onTouchMove(ev: TouchEvent) {
        const interaction = this.interaction.value;
        if (interaction) {
            const points = Array.from(ev.touches).map(t => this.eventPos(t));
            interaction.next(points);
        }
        ev.preventDefault();
    }

    private onTouchEnd(ev: TouchEvent) {
        const interaction = this.interaction.value;
        if (interaction) {
            interaction.finish();
            this.interaction.value = undefined;
        }
        ev.preventDefault();
    }

    private onWheel(ev: WheelEvent) {
        this.scale(this.eventPos(ev), Math.pow(0.5, ev.deltaY / 256));
        ev.preventDefault();
    }

    private scale(center: Vec2, scale: number) {
        const viewModel = this.canvasViewModel.value;
        if (!viewModel) { return; }

        const transform = Transform.translate(center.negate()).scale(new Vec2(scale, scale)).translate(center);
        this.renderer.transform.value = viewModel.transform.value = viewModel.transform.value.merge(transform);
        this.renderer.update();
    }

    static template = `
        <canvas class="sg-canvas"></canvas>
    `;

    canvasViewModel = new Variable<CanvasViewModel | undefined>(undefined);
    renderer = new Renderer(this.element as HTMLCanvasElement);
    interaction = new AutoDisposeVariable<Interaction>(undefined);
    isDragMode = new Variable(false);

    constructor(mountPoint: MountPoint) {
        super(mountPoint);
        this.disposables.add(this.renderer);
        this.subscribeWithDestination(this.canvasViewModel.changed, (vm, dest) => {
            if (vm) {
                this.renderer.canvas.value = vm.canvas;
                dest.subscribe(vm.transform.changed, t => this.renderer.transform.value = t);
            }
        });

        if (window["PointerEvent"]) {
            this.element.addEventListener('pointermove', (ev) => this.onPointerMove(ev));
            this.element.addEventListener('pointerup', (ev) => this.onPointerUp(ev));
            this.element.addEventListener('pointerdown', (ev) => this.onPointerDown(ev));
        } else {
            this.element.addEventListener('mousemove', (ev) => this.onMouseMove(ev as MouseEvent));
            this.element.addEventListener('mouseup', (ev) => this.onMouseUp(ev as MouseEvent));
            this.element.addEventListener('mousedown', (ev) => this.onMouseDown(ev as MouseEvent));
            this.element.addEventListener('touchstart', (ev) => this.onTouchStart(ev));
            this.element.addEventListener('touchmove', (ev) => this.onTouchMove(ev));
            this.element.addEventListener('touchend', (ev) => this.onTouchEnd(ev));
        }

        this.element.addEventListener('wheel', this.onWheel.bind(this));

        this.element.addEventListener('contextmenu', (ev) => {
            ev.preventDefault();
        });

        this.subscribe(
            Rx.Observable.combineLatest(
                this.interaction.changed.map(i => i instanceof DraggingInteraction),
                this.isDragMode.changed,
                (dragging, mode) => dragging || mode
            ),
            this.slot.toggleClass("dragging")
        );

        const mousetrap = Mousetrap(document);
        mousetrap.bind("space", () => {
            this.isDragMode.value = true;
        }, "keydown");
        mousetrap.bind("space", () => {
            this.isDragMode.value = false;
        }, "keyup");
        mousetrap.bind("mod+z", () => {
            const canvasVM = this.canvasViewModel.value;
            if (canvasVM && canvasVM.canvas.canUndo.value) {
                canvasVM.canvas.undo();
            }
        });
        mousetrap.bind(["mod+shift+z", "mod+y"], () => {
            const canvasVM = this.canvasViewModel.value;
            if (canvasVM && canvasVM.canvas.canRedo.value) {
                canvasVM.canvas.redo();
            }
        });
        this.disposables.add({
            dispose: () => mousetrap.reset()
        });
    }
}
