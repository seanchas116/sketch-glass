import Renderer from '../renderer/Renderer';
import Stroke from '../model/Stroke';
import Point from '../lib/geometry/Point';
import Color from '../lib/geometry/Color';
import Transform from '../lib/geometry/Transform';
import Background from '../lib/geometry/Background';
import * as _ from 'lodash';

function touchPoint(touch: Touch) {
  return new Point(touch.clientX, touch.clientY);
}

enum InteractionState {
  None, Pressed, Pinching
}

export default
class CanvasViewController {

  renderer: Renderer;

  interactionState = InteractionState.None;
  pinchStartPoints: Point[];

  transform = Transform.identity();
  initialTransform = Transform.identity();

  currentStroke: Stroke;
  isStroking = false;
  strokeWidth = 3;
  strokeColor = new Color(0,0,0,1);

  constructor(public element: HTMLElement) {
    this.renderer = new Renderer({background: new Background(new Color(255,255,255,1))});

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
    this.initialTransform = this.transform;
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

    transform = this.initialTransform.merge(transform);
    this.updateTransform(transform);
    this.renderer.update();
  }

  private pinchEnd() {
    this.interactionState = InteractionState.None;
  }

  private pressStart(pos: Point) {
    this.interactionState = InteractionState.Pressed;

    pos = pos.transform(this.transform.invert());
    const stroke = this.currentStroke = new Stroke();
    stroke.width = this.strokeWidth;
    stroke.color = this.strokeColor;
    stroke.addPoint(pos);

    this.renderer.addStroke(stroke);
    this.renderer.update(true);
  }

  private pressMove(pos: Point) {
    if (this.interactionState === InteractionState.Pressed) {
      pos = pos.transform(this.transform.invert());
      this.currentStroke.addPoint(pos);
      this.renderer.update(true);
    }
  }

  private pressEnd() {
    if (this.interactionState === InteractionState.Pressed) {
      this.interactionState = InteractionState.None;
    }
  }

  private updateTransform(transform: Transform) {
    this.transform = transform;
    this.renderer.transform = transform;
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
    const transform = this.transform.translate(new Point(-ev.deltaX, -ev.deltaY));
    this.updateTransform(transform);
    this.renderer.update();
    ev.preventDefault();
  }
}
