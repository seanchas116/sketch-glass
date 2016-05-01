import Vec2 from '../lib/geometry/Vec2';
import Color from '../lib/geometry/Color';

export
interface StrokeData {
  points: [number, number][];
  color: [number, number, number, number];
  width: number;
}

export default
class Stroke {
  constructor(public points: Vec2[], public color: Color, public width: number) {
  }

  static fromData(data: StrokeData) {
    return new Stroke(
      data.points.map(([x, y]) => new Vec2(x, y)),
      new Color(data.color[0], data.color[1], data.color[2], data.color[3]),
      data.width
    );
  }

  toData(): StrokeData {
    return {
      points: this.points.map(p => [p.x, p.y] as [number, number]),
      color: [this.color.r, this.color.g, this.color.b, this.color.a],
      width: this.width,
    };
  }
}
