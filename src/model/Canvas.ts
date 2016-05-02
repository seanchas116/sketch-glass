import Stroke from './Stroke';
import Transform from '../lib/geometry/Transform';
import Variable from "../lib/rx/Variable";
import ObservableArray from "../lib/rx/ObservableArray";

export default
class Canvas {
  strokes = new ObservableArray<Stroke>([]);
}
