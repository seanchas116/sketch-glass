import Vec2 from '../lib/geometry/Vec2';
import Color from '../lib/geometry/Color';

export default
class Stroke {
  points: Vec2[] = [];
  color = new Color(0,0,0,1);
  width = 1;
  type = "pen";
}
