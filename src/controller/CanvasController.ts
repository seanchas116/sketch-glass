import Renderer from '../renderer/Renderer';
import Stroke from '../model/Stroke';
import Point from '../common/Point';
import Color from '../common/Color';
import Transform from '../common/Transform';
import Background from '../common/Background';
import _ from 'lodash';

function touchPoint(touch: Touch) {
  return new Point(touch.clientX, touch.clientY);
}

enum InteractionState {
  None, Pressed, Pinching
}

export default
class CanvasController {

  element: HTMLElement;

  renderer: Renderer;

  interactionState = InteractionState.None;
  pinchStartPoints: Point[];

  transform = Transform.identity();
  initialTransform = Transform.identity();

  currentStroke: Stroke;
  isStroking = false;
  strokeWidth = 10;
  strokeColor = new Color(0,0,0,1);

  constructor() {
    this.renderer = new Renderer({background: new Background(new Color(255,255,255,1))});

    var elem = this.element = document.createElement('div');
    elem.className = 'canvas-area';
    elem.appendChild(this.renderer.element);

    elem.addEventListener('mousemove', this.onMouseMove.bind(this));
    elem.addEventListener('mousedown', this.onMouseDown.bind(this));
    elem.addEventListener('mouseup', this.onMouseUp.bind(this));

    elem.addEventListener('touchmove', this.onTouchMove.bind(this));
    elem.addEventListener('touchstart', this.onTouchStart.bind(this));
    elem.addEventListener('touchend', this.onTouchEnd.bind(this));

    elem.addEventListener('wheel', this.onWheel.bind(this));
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

    var scale = points[0].sub(points[1]).length / this.pinchStartPoints[0].sub(this.pinchStartPoints[1]).length;

    var centerStart = this.pinchStartPoints[0].add(this.pinchStartPoints[1]).mul(0.5);
    var center = points[0].add(points[1]).mul(0.5);

    var diff = center.sub(centerStart.mul(scale));

    var transform = Transform.scale(scale, scale).merge(Transform.translation(diff));

    var transform = this.initialTransform.merge(transform);
    this.updateTransform(transform);
    this.renderer.update();
  }

  private pinchEnd() {
    this.interactionState = InteractionState.None;
  }

  private pressStart(pos: Point) {
    this.interactionState = InteractionState.Pressed;

    pos = pos.transform(this.transform.invert());
    var stroke = this.currentStroke = new Stroke();
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
      var touch = ev.touches[0];
      this.pressMove(touchPoint(touch));
    }
    else if (ev.touches.length === 2) {
      this.pinchMove([0,1].map(i => touchPoint(ev.touches[i])));
    }
    ev.preventDefault();
  }
  private onTouchStart(ev: TouchEvent) {
    if (ev.touches.length === 1) {
      var touch = ev.touches[0];
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
    var transform = this.transform.translate(new Point(-ev.deltaX, -ev.deltaY));
    this.updateTransform(transform);
    this.renderer.update();
    ev.preventDefault();
  }
}
