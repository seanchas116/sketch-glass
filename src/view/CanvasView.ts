import Component from "../lib/ui/Component";
import Renderer from '../renderer/Renderer';
import Stroke from '../model/Stroke';
import Vec2 from '../lib/geometry/Vec2';
import Transform from '../lib/geometry/Transform';
import Canvas from "../model/Canvas";
import TreeDisposable from "../lib/TreeDisposable";
import Tool from "../model/Tool";
import Variable from "../lib/rx/Variable";
import CanvasViewModel from "../viewmodel/CanvasViewModel";
import DisposableBag from "../lib/DisposableBag";

function touchPoint(touch: Touch) {
  return new Vec2(touch.clientX, touch.clientY);
}

enum InteractionState {
  None, Drawing, Erasing, Pinching, Dragging
}

class StrokeHandler extends TreeDisposable {
  interactionState = new Variable(InteractionState.None);
  startPoint: Vec2;
  pinchStartPoints: Vec2[];

  transform: Transform;
  initialTransform = Transform.identity();

  currentStroke: Stroke;
  isStroking = false;

  canvasDisposables = new DisposableBag();
  canvasViewModel = new Variable<CanvasViewModel | undefined>(undefined);

  constructor(public renderer: Renderer) {
    super();
    this.canvasViewModel.observable.subscribe(vm => {
      this.canvasDisposables.clear();
      if (vm != undefined) {
        renderer.canvas.value = vm.canvas;
        this.canvasDisposables.add(
          vm.transform.observable.subscribe(t => {
            renderer.transform = t;
            this.transform = t;
          })
        );
      } else {
        renderer.canvas.value = undefined;
      }
    });
  }

  pinchStart(points: Vec2[]) {
    const viewModel = this.canvasViewModel.value;
    if (!viewModel) { return; }

    this.interactionState.value = InteractionState.Pinching;
    this.pinchStartPoints = points;
    this.initialTransform = this.transform;
  }

  pinchMove(points: Vec2[]) {
    const viewModel = this.canvasViewModel.value;
    if (!viewModel) { return; }

    if (this.interactionState.value !== InteractionState.Pinching) {
      this.pinchStart(points);
    }

    const scale = points[0].sub(points[1]).length / this.pinchStartPoints[0].sub(this.pinchStartPoints[1]).length;

    const centerStart = this.pinchStartPoints[0].add(this.pinchStartPoints[1]).mul(0.5);
    const center = points[0].add(points[1]).mul(0.5);

    const diff = center.sub(centerStart.mul(scale));

    let transform = Transform.scale(new Vec2(scale, scale)).merge(Transform.translation(diff));

    this.renderer.transform = this.transform = this.initialTransform.merge(transform);
    this.renderer.update();
  }

  pinchEnd() {
    const viewModel = this.canvasViewModel.value;
    if (!viewModel) { return; }

    this.interactionState.value = InteractionState.None;
    viewModel.transform.value = this.transform;
  }

  pressStart(pos: Vec2) {
    const viewModel = this.canvasViewModel.value;
    if (!viewModel) { return; }

    pos = pos.transform(this.transform.invert());
    if (viewModel.tool.value == Tool.Pen) {
      this.interactionState.value = InteractionState.Drawing;
      this.renderer.strokeBegin(viewModel.penWidth.value, viewModel.color.value);
      this.renderer.strokeNext(pos);
    } else {
      this.interactionState.value = InteractionState.Erasing;
      this.renderer.eraseBegin(viewModel.eraserWidth.value);
      this.renderer.eraseNext(pos);
    }
  }

  pressMove(pos: Vec2) {
    const viewModel = this.canvasViewModel.value;
    if (!viewModel) { return; }

    pos = pos.transform(this.transform.invert());
    if (this.interactionState.value === InteractionState.Drawing) {
      this.renderer.strokeNext(pos);
    } else if (this.interactionState.value == InteractionState.Erasing) {
      this.renderer.eraseNext(pos);
    }
  }

  pressEnd() {
    const viewModel = this.canvasViewModel.value;
    if (!viewModel) { return; }

    if (this.interactionState.value === InteractionState.Drawing) {
      this.interactionState.value = InteractionState.None;
      this.renderer.strokeEnd();
    } else if (this.interactionState.value == InteractionState.Erasing) {
      this.renderer.eraseEnd();
    }
  }

  dragStart(pos: Vec2) {
    const viewModel = this.canvasViewModel.value;
    if (!viewModel) { return; }

    this.interactionState.value = InteractionState.Dragging;
    this.startPoint = pos;
    this.initialTransform = viewModel.transform.value;
  }

  dragMove(pos: Vec2) {
    const viewModel = this.canvasViewModel.value;
    if (!viewModel) { return; }

    if (this.interactionState.value == InteractionState.Dragging) {
      this.transform = this.renderer.transform = this.initialTransform.translate(pos.sub(this.startPoint));
      this.renderer.update();
    }
  }

  dragEnd() {
    const viewModel = this.canvasViewModel.value;
    if (!viewModel) { return; }

    if (this.interactionState.value == InteractionState.Dragging) {
      viewModel.transform.value = this.transform;
      this.interactionState.value = InteractionState.None;
    }
  }

  scale(center: Vec2, scale: number) {
    const viewModel = this.canvasViewModel.value;
    if (!viewModel) { return; }

    const transform = Transform.translation(center.negate()).scale(new Vec2(scale, scale)).translate(center);
    viewModel.transform.value = viewModel.transform.value.merge(transform);
    this.renderer.update();
  }
}

export default
class CanvasView extends Component {
  strokeHandler: StrokeHandler;

  private onMouseMove(ev: MouseEvent) {
    const pos = new Vec2(ev.clientX, ev.clientY)
    if (ev.button == 0) {
      this.strokeHandler.pressMove(pos);
    } else if (ev.button == 2) {
      this.strokeHandler.dragMove(pos);
    }
  }
  private onMouseDown(ev: MouseEvent) {
    const pos = new Vec2(ev.clientX, ev.clientY)
    if (ev.button == 0) {
      this.strokeHandler.pressStart(pos);
    } else if (ev.button == 2) {
      console.log("right click");
      this.strokeHandler.dragStart(pos);
    }
  }
  private onMouseUp(ev: MouseEvent) {
    if (ev.button == 0) {
      this.strokeHandler.pressEnd();
    } else if (ev.button == 2) {
      this.strokeHandler.dragEnd();
    }
  }

  private onTouchMove(ev: TouchEvent) {
    if (ev.touches.length === 1) {
      const touch = ev.touches[0];
      this.strokeHandler.pressMove(touchPoint(touch));
    }
    else if (ev.touches.length === 2) {
      this.strokeHandler.pinchMove([0,1].map(i => touchPoint(ev.touches[i])));
    }
    ev.preventDefault();
  }
  private onTouchStart(ev: TouchEvent) {
    if (ev.touches.length === 1) {
      const touch = ev.touches[0];
      this.strokeHandler.pressStart(touchPoint(touch));
    }
    else if (ev.touches.length === 2) {
      this.strokeHandler.pinchStart([0,1].map(i => touchPoint(ev.touches[i])));
    }
    ev.preventDefault();
  }
  private onTouchEnd(ev: TouchEvent) {
    this.strokeHandler.pressEnd();
    this.strokeHandler.pinchEnd();
    ev.preventDefault();
  }

  private onWheel(ev: WheelEvent) {
    this.strokeHandler.scale(new Vec2(ev.clientX, ev.clientY), Math.pow(0.5, ev.deltaY / 256));
    ev.preventDefault();
  }

  static template = `
    <canvas class="sg-canvas"></canvas>
  `;

  canvasViewModel = new Variable<CanvasViewModel | undefined>(undefined);

  constructor(mountPoint: Element) {
    super(mountPoint);
    const renderer = new Renderer(this.element as HTMLCanvasElement);
    this.strokeHandler = new StrokeHandler(renderer);
    this.disposables.add(
      this.strokeHandler,
      renderer,
      this.canvasViewModel.observable.subscribe(this.strokeHandler.canvasViewModel)
    );

    this.element.addEventListener('mousemove', this.onMouseMove.bind(this));
    this.element.addEventListener('mousedown', this.onMouseDown.bind(this));
    this.element.addEventListener('mouseup', this.onMouseUp.bind(this));

    this.element.addEventListener('touchmove', this.onTouchMove.bind(this));
    this.element.addEventListener('touchstart', this.onTouchStart.bind(this));
    this.element.addEventListener('touchend', this.onTouchEnd.bind(this));

    this.element.addEventListener('wheel', this.onWheel.bind(this));

    this.element.addEventListener('contextmenu', (ev) => {
      ev.preventDefault();
    });

    this.strokeHandler.interactionState.observable
      .map(s => s == InteractionState.Dragging)
      .subscribe(this.slot.toggleClass("dragging"));
  }
}
