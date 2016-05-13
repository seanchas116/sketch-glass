import Vec2 from '../lib/geometry/Vec2';
import Color from '../lib/geometry/Color';
import randomID from "../lib/randomID";

export
    interface StrokeData {
    type: "stroke";
    points: [number, number][];
    color: [number, number, number, number];
    width: number;
    id: string;
    createdAt: string;
}

export default
    class Stroke {
    constructor(public points: Vec2[], public color: Color, public width: number, public id = randomID(), public createdAt = new Date()) {
    }

    static fromData(data: StrokeData) {
        return new Stroke(
            data.points.map(([x, y]) => new Vec2(x, y)),
            new Color(data.color[0], data.color[1], data.color[2], data.color[3]),
            data.width,
            data.id,
            new Date(data.createdAt)
        );
    }

    toData(): StrokeData {
        return {
            type: "stroke",
            points: this.points.map(p => [p.x, p.y] as [number, number]),
            color: [this.color.r, this.color.g, this.color.b, this.color.a],
            width: this.width,
            id: this.id,
            createdAt: this.createdAt.toString(),
        };
    }
}
