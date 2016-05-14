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

const {toolBoxViewModel} = appViewModel;

class Interaction {
    constructor(public canvasVM: CanvasViewModel, public renderer: Renderer) {
    }

    begin(events: PointerEvent[]) {
    }

    next(events: PointerEvent[]) {
    }

    dispose() {
    }

    finish() {
    }

    viewPos(ev: PointerEvent) {
        return new Vec2(ev.clientX, this.renderer.size.height - ev.clientY);
    }

    scenePos(ev: PointerEvent) {
        return this.viewPos(ev).transform(this.canvasVM.transform.value.invert());
    }

    static pointerCount = 1;

    static canInitiate(canvasVM: CanvasViewModel, events: PointerEvent[]) {
        return true;
    }
}

class DrawingInteraction extends Interaction {
    isDisposed = false;

    begin(events: PointerEvent[]) {
        const pos = this.scenePos(events[0]);
        if (!pos) { return; }
        this.renderer.strokeBegin(toolBoxViewModel.penWidth.value, toolBoxViewModel.color.value);
        this.renderer.strokeNext(pos);
    }

    next(events: PointerEvent[]) {
        const pos = this.scenePos(events[0]);
        if (!pos) { return; }
        this.renderer.strokeNext(pos);
    }

    finish() {
        this.renderer.strokeEnd();
        this.isDisposed = true;
    }

    static canInitiate(canvasVM: CanvasViewModel, events: PointerEvent[]) {
        return toolBoxViewModel.tool.value == Tool.Pen;
    }
}

class ErasingInteraction extends Interaction {

    begin(events: PointerEvent[]) {
        const pos = this.scenePos(events[0]);
        if (!pos) { return; }
        this.renderer.eraseBegin(toolBoxViewModel.penWidth.value);
        this.renderer.eraseNext(pos);
    }

    next(events: PointerEvent[]) {
        const pos = this.scenePos(events[0]);
        if (!pos) { return; }
        this.renderer.eraseNext(pos);
    }

    static canInitiate(canvasVM: CanvasViewModel, events: PointerEvent[]) {
        return toolBoxViewModel.tool.value == Tool.Eraser;
    }
}

class PinchingInteraction extends Interaction {
    startPoints: Vec2[];
    initTransform: Transform;
    transform: Transform;

    begin(events: PointerEvent[]) {
        this.startPoints = events.map(e => this.viewPos(e));
        this.initTransform = this.canvasVM.transform.value;
    }

    next(events: PointerEvent[]) {
        const points = events.map(e => this.viewPos(e));

        const scale = points[0].sub(points[1]).length / this.startPoints[0].sub(this.startPoints[1]).length;

        const centerStart = this.startPoints[0].add(this.startPoints[1]).mul(0.5);
        const center = points[0].add(points[1]).mul(0.5);

        const diff = center.sub(centerStart.mul(scale));

        let transform = Transform.scale(new Vec2(scale, scale)).merge(Transform.translate(diff));

        this.renderer.transform = this.transform = this.initTransform.merge(transform);
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

    begin(events: PointerEvent[]) {
        this.startPoint = this.viewPos(events[0]);
        this.initTransform = this.canvasVM.transform.value;
    }

    next(events: PointerEvent[]) {
        const pos = this.viewPos(events[0]);
        this.transform = this.renderer.transform = this.initTransform.translate(pos.sub(this.startPoint));
        this.renderer.update();
    }

    finish() {
        this.canvasVM.transform.value = this.transform;
    }

    static canInitiate(canvasVM: CanvasViewModel, events: PointerEvent[]) {
        return events[0].button == 2;
    }
}

const interactionClasses = [DraggingInteraction, DrawingInteraction, ErasingInteraction, PinchingInteraction];

export default
class CanvasView extends Component {

    eventPos(ev: { clientX: number, clientY: number }) {
        return new Vec2(ev.clientX, this.renderer.size.height - ev.clientY);
    }

    pointers = new Map<number, PointerEvent>();

    private onPointerDown(ev: PointerEvent) {
        this.pointers.set(ev.pointerId, ev);

        const canvasVM = this.canvasViewModel.value;
        if (!canvasVM) { return; }

        const events = Array.from(this.pointers.values());

        for (const klass of interactionClasses) {
            if (events.length == klass.pointerCount && klass.canInitiate(canvasVM, events)) {
                const interaction = new klass(canvasVM, this.renderer);
                interaction.begin(events);
                this.interaction.value = interaction;
                console.log(interaction, this.interaction.value);
                return;
            }
        }
    }

    private onPointerMove(ev: PointerEvent) {
        this.pointers.set(ev.pointerId, ev);
        const interaction = this.interaction.value;
        if (interaction) {
            interaction.next(Array.from(this.pointers.values()));
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

    private onWheel(ev: WheelEvent) {
        this.scale(this.eventPos(ev), Math.pow(0.5, ev.deltaY / 256));
        ev.preventDefault();
    }

    private scale(center: Vec2, scale: number) {
        const viewModel = this.canvasViewModel.value;
        if (!viewModel) { return; }

        const transform = Transform.translate(center.negate()).scale(new Vec2(scale, scale)).translate(center);
        this.renderer.transform = viewModel.transform.value = viewModel.transform.value.merge(transform);
        this.renderer.update();
    }

    static template = `
        <canvas class="sg-canvas" touch-action="none"></canvas>
    `;

    canvasViewModel = new Variable<CanvasViewModel | undefined>(undefined);
    renderer = new Renderer(this.element as HTMLCanvasElement);
    interaction = new AutoDisposeVariable<Interaction>(undefined);

    constructor(mountPoint: MountPoint) {
        super(mountPoint);
        this.disposables.add(this.renderer);
        this.subscribe(this.canvasViewModel.changed.map(vm => vm ? vm.canvas : undefined), this.renderer.canvas);

        this.element.addEventListener('pointermove', (ev) => this.onPointerMove(ev));
        this.element.addEventListener('pointerup', (ev) => this.onPointerUp(ev));
        this.element.addEventListener('pointerdown', (ev) => this.onPointerDown(ev));

        this.element.addEventListener('wheel', this.onWheel.bind(this));

        this.element.addEventListener('contextmenu', (ev) => {
            ev.preventDefault();
        });

        this.subscribe(
            this.interaction.changed.map(i => i instanceof DraggingInteraction),
            this.slot.toggleClass("dragging")
        );
    }
}
