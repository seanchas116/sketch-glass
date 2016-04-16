import Component from "../lib/ui/Component";
import Renderer from '../renderer/Renderer';
import Stroke from '../model/Stroke';
import Vec2 from '../lib/geometry/Vec2';
import Color from '../lib/geometry/Color';
import Transform from '../lib/geometry/Transform';
import Background from '../lib/geometry/Background';
import Canvas from "../model/Canvas";
import DisposableBag from "../lib/DisposableBag";
import Tool from "../model/Tool";

function touchPoint(touch: Touch) {
  return new Vec2(touch.clientX, touch.clientY);
}

enum InteractionState {
  None, Pressed, Pinching
}

class StrokeHandler {
  interactionState = InteractionState.None;
  pinchStartPoints: Vec2[];

  initialTransform = Transform.identity();

  currentStroke: Stroke;
  isStroking = false;

  constructor(public canvas: Canvas, public renderer: Renderer) {
  }

  dispose() {
    this.renderer.dispose();
  }

  pinchStart(points: Vec2[]) {
    this.interactionState = InteractionState.Pinching;
    this.pinchStartPoints = points;
    this.initialTransform = this.canvas.transform.value;
  }

  pinchMove(points: Vec2[]) {
    if (this.interactionState !== InteractionState.Pinching) {
      this.pinchStart(points);
    }

    const scale = points[0].sub(points[1]).length / this.pinchStartPoints[0].sub(this.pinchStartPoints[1]).length;

    const centerStart = this.pinchStartPoints[0].add(this.pinchStartPoints[1]).mul(0.5);
    const center = points[0].add(points[1]).mul(0.5);

    const diff = center.sub(centerStart.mul(scale));

    let transform = Transform.scale(new Vec2(scale, scale)).merge(Transform.translation(diff));

    this.canvas.transform.value = this.initialTransform.merge(transform);
    this.canvas.requestUpdate();
  }

  pinchEnd() {
    this.interactionState = InteractionState.None;
  }

  pressStart(pos: Vec2) {
    this.interactionState = InteractionState.Pressed;

    pos = pos.transform(this.canvas.transform.value.invert());
    const stroke = this.currentStroke = new Stroke();
    if (this.canvas.toolBox.tool.value == Tool.Pen) {
      stroke.width = this.canvas.toolBox.penWidth.value;
      stroke.color = this.canvas.toolBox.color.value;
    } else {
      stroke.width = this.canvas.toolBox.eraserWidth.value;
      stroke.color = new Color(255,255,255,1);
    }
    stroke.addPoint(pos);

    this.renderer.addStroke(stroke);
    this.renderer.render();
  }

  pressMove(pos: Vec2) {
    if (this.interactionState === InteractionState.Pressed) {
      pos = pos.transform(this.canvas.transform.value.invert());
      this.currentStroke.addPoint(pos);
      this.renderer.render();
    }
  }

  pressEnd() {
    if (this.interactionState === InteractionState.Pressed) {
      this.interactionState = InteractionState.None;
    }
  }

  translate(offset: Vec2) {
    const transform = this.canvas.transform.value.translate(offset);
    this.canvas.transform.value = transform;
    this.renderer.update();
  }
}

export default
class CanvasView extends Component {
  strokeHandler: StrokeHandler;

  get canvas() {
    return this.strokeHandler.canvas;
  }

  private onMouseMove(ev: MouseEvent) {
    //console.log(`mouse move at ${ev.clientX}, ${ev.clientY}`);
    this.strokeHandler.pressMove(new Vec2(ev.clientX, ev.clientY));
  }
  private onMouseDown(ev: MouseEvent) {
    //console.log(`mouse down at ${ev.clientX}, ${ev.clientY}`);
    this.strokeHandler.pressStart(new Vec2(ev.clientX, ev.clientY));
  }
  private onMouseUp(ev: MouseEvent) {
    //console.log(`mouse up at ${ev.clientX}, ${ev.clientY}`);
    this.strokeHandler.pressEnd();
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
    this.strokeHandler.translate(new Vec2(-ev.deltaX, -ev.deltaY));
    ev.preventDefault();
  }

  private setNewCanvas(canvas: Canvas) {
    if (this.strokeHandler) {
      this.strokeHandler.dispose();
      this.disposables.delete(this.strokeHandler);
    }
    const renderer = new Renderer(canvas);
    this.strokeHandler = new StrokeHandler(canvas, renderer)
    this.element.appendChild(renderer.element);
    this.disposables.add(this.strokeHandler);
  }

  static template = `
    <main ref="canvas" class="sg-canvas"></main>
  `;

  constructor(canvas: Canvas) {
    super();
    this.element.addEventListener('mousemove', this.onMouseMove.bind(this));
    this.element.addEventListener('mousedown', this.onMouseDown.bind(this));
    this.element.addEventListener('mouseup', this.onMouseUp.bind(this));

    this.element.addEventListener('touchmove', this.onTouchMove.bind(this));
    this.element.addEventListener('touchstart', this.onTouchStart.bind(this));
    this.element.addEventListener('touchend', this.onTouchEnd.bind(this));

    this.element.addEventListener('wheel', this.onWheel.bind(this));

    this.setNewCanvas(canvas);
  }
}
