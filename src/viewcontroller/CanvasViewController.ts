import Renderer from '../renderer/Renderer';
import Stroke from '../model/Stroke';
import Point from '../lib/geometry/Point';
import Color from '../lib/geometry/Color';
import Transform from '../lib/geometry/Transform';
import Background from '../lib/geometry/Background';
import CanvasViewModel from "../viewmodel/CanvasViewModel";
import DisposableBag from "../lib/DisposableBag";
import * as _ from 'lodash';

function touchPoint(touch: Touch) {
  return new Point(touch.clientX, touch.clientY);
}

enum InteractionState {
  None, Pressed, Pinching
}

export default
class CanvasViewController extends DisposableBag {
  renderer: Renderer;

  interactionState = InteractionState.None;
  pinchStartPoints: Point[];

  initialTransform = Transform.identity();

  currentStroke: Stroke;
  isStroking = false;

  constructor(public element: HTMLElement, public viewModel: CanvasViewModel) {
    super();

    this.renderer = new Renderer(viewModel);
    this.addDisposable(this.renderer);

    element.appendChild(this.renderer.element);

    element.addEventListener('mousemove', this.onMouseMove.bind(this));
    element.addEventListener('mousedown', this.onMouseDown.bind(this));
    element.addEventListener('mouseup', this.onMouseUp.bind(this));

    element.addEventListener('touchmove', this.onTouchMove.bind(this));
    element.addEventListener('touchstart', this.onTouchStart.bind(this));
    element.addEventListener('touchend', this.onTouchEnd.bind(this));

    element.addEventListener('wheel', this.onWheel.bind(this));
  }

  private pinchStart(points: Point[]) {
    this.interactionState = InteractionState.Pinching;
    this.pinchStartPoints = points;
    this.initialTransform = this.viewModel.transform.value;
  }

  private pinchMove(points: Point[]) {
    if (this.interactionState !== InteractionState.Pinching) {
      this.pinchStart(points);
    }

    const scale = points[0].sub(points[1]).length / this.pinchStartPoints[0].sub(this.pinchStartPoints[1]).length;

    const centerStart = this.pinchStartPoints[0].add(this.pinchStartPoints[1]).mul(0.5);
    const center = points[0].add(points[1]).mul(0.5);

    const diff = center.sub(centerStart.mul(scale));

    let transform = Transform.scale(scale, scale).merge(Transform.translation(diff));

    this.viewModel.transform.value = this.initialTransform.merge(transform);
    this.viewModel.requestUpdate();
  }

  private pinchEnd() {
    this.interactionState = InteractionState.None;
  }

  private pressStart(pos: Point) {
    this.interactionState = InteractionState.Pressed;

    pos = pos.transform(this.viewModel.transform.value.invert());
    const stroke = this.currentStroke = new Stroke();
    stroke.width = this.viewModel.strokeWidth.value;
    stroke.color = this.viewModel.strokeColor.value;
    stroke.addPoint(pos);

    this.renderer.addStroke(stroke);
    this.renderer.update(true);
  }

  private pressMove(pos: Point) {
    if (this.interactionState === InteractionState.Pressed) {
      pos = pos.transform(this.viewModel.transform.value.invert());
      this.currentStroke.addPoint(pos);
      this.renderer.update(true);
    }
  }

  private pressEnd() {
    if (this.interactionState === InteractionState.Pressed) {
      this.interactionState = InteractionState.None;
    }
  }

  private onMouseMove(ev: MouseEvent) {
    //console.log(`mouse move at ${ev.clientX}, ${ev.clientY}`);
    this.pressMove(new Point(ev.clientX, ev.clientY));
  }
  private onMouseDown(ev: MouseEvent) {
    //console.log(`mouse down at ${ev.clientX}, ${ev.clientY}`);
    this.pressStart(new Point(ev.clientX, ev.clientY));
  }
  private onMouseUp(ev: MouseEvent) {
    //console.log(`mouse up at ${ev.clientX}, ${ev.clientY}`);
    this.pressEnd();
  }

  private onTouchMove(ev: TouchEvent) {
    if (ev.touches.length === 1) {
      const touch = ev.touches[0];
      this.pressMove(touchPoint(touch));
    }
    else if (ev.touches.length === 2) {
      this.pinchMove([0,1].map(i => touchPoint(ev.touches[i])));
    }
    ev.preventDefault();
  }
  private onTouchStart(ev: TouchEvent) {
    if (ev.touches.length === 1) {
      const touch = ev.touches[0];
      this.pressStart(touchPoint(touch));
    }
    else if (ev.touches.length === 2) {
      this.pinchStart([0,1].map(i => touchPoint(ev.touches[i])));
    }
    ev.preventDefault();
  }
  private onTouchEnd(ev: TouchEvent) {
    this.pressEnd();
    this.pinchEnd();
    ev.preventDefault();
  }

  private onWheel(ev: WheelEvent) {
    const transform = this.viewModel.transform.value.translate(new Point(-ev.deltaX, -ev.deltaY));
    this.viewModel.transform.value = transform;
    this.renderer.update();
    ev.preventDefault();
  }
}
