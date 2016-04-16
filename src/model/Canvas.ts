import Stroke from './Stroke';
import Point from '../lib/geometry/Point';
import Color from '../lib/geometry/Color';
import Transform from '../lib/geometry/Transform';
import Variable from "../lib/rx/Variable";
import ToolBox from "./ToolBox";
import DisposableBag from "../lib/DisposableBag";
import * as Rx from "rx";

export default
class Canvas {
  transform = new Variable(Transform.identity());
  toolBox = new ToolBox();
  strokes: Stroke[] = [];
  strokeAdded = new Rx.Subject<Stroke>();
  updateNeeded = new Rx.Subject<void>();

  addStroke(stroke: Stroke) {
    this.strokes.push(stroke);
    this.strokeAdded.onNext(stroke);
  }

  requestUpdate() {
    this.updateNeeded.onNext(undefined);
  }
}
