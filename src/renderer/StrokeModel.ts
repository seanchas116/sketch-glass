import Stroke from "../model/Stroke";
import Polygon from "./Polygon";
import Vec2 from "../lib/geometry/Vec2";
import QuadraticCurve from "../lib/geometry/QuadraticCurve";
import StrokeCollider from "./StrokeCollider";
import StrokeShader from "./StrokeShader";
import Model from "./Model";
import Transform from "../lib/geometry/Transform";
import Rect from "../lib/geometry/Rect";
import Color from "../lib/geometry/Color";
import randomID from "../lib/randomID";

export default
class StrokeModel implements Model {
    isDisposed = false;
    polygon = new Polygon(this.gl, this.shader, []);
    lastSectionLength = 0;
    lastBoundingRect = Rect.empty;
    collider: StrokeCollider;
    vertices: Vec2[] = [];
    points: Vec2[] = [];
    boundingRect = Rect.empty;

    static fromStroke(gl: WebGLRenderingContext, shader: StrokeShader, stroke: Stroke) {
        const model = new StrokeModel(gl, shader, stroke.color, stroke.width, stroke.id, stroke.createdAt);
        for (const p of stroke.points) {
            model.addPoint(p);
        }
        model.finalize();
        return model;
    }

    constructor(public gl: WebGLRenderingContext, public shader: StrokeShader, public color: Color, public width: number, public id = randomID(), public createdAt = new Date()) {
    }

    dispose() {
        if (!this.isDisposed) {
            console.log("disposing stroke model");
            this.polygon.dispose();
            this.isDisposed = true;
        }
    }

    toStroke() {
        return new Stroke(this.points, this.color, this.width, this.id, this.createdAt);
    }

    addPoint(pos: Vec2) {
        const bounding = this.drawPoint(pos);
        this.polygon.updateBuffer(false);
        return bounding;
    }

    drawPoint(pos: Vec2) {
        const {points} = this;
        points.push(pos);
        const nPoints = points.length;
        let bounding = this.lastBoundingRect;

        if (nPoints === 2) {
            bounding = bounding.union(this.drawSection(points));
        } else if (nPoints === 3) {
            this.rewindLastSection();
            const c = new QuadraticCurve(points[0], points[1], points[2]);
            bounding = bounding.union(this.drawSection(c.subdivide()));
        } else if (nPoints === 4) {
            this.rewindLastSection();
            const mid = points[1].add(points[2]).mul(0.5);
            const c1 = new QuadraticCurve(points[0], points[1], mid);
            const c2 = new QuadraticCurve(mid, points[2], points[3]);
            bounding = bounding.union(this.drawSection(c1.subdivide()));
            bounding = bounding.union(this.drawSection(c2.subdivide()));
        } else if (nPoints > 4) {
            this.rewindLastSection();
            const c1 = new QuadraticCurve(
                points[nPoints - 4].midpoint(points[nPoints - 3]),
                points[nPoints - 3],
                points[nPoints - 3].midpoint(points[nPoints - 2])
            );
            const c2 = new QuadraticCurve(
                points[nPoints - 3].midpoint(points[nPoints - 2]),
                points[nPoints - 2],
                points[nPoints - 1]
            );
            bounding = bounding.union(this.drawSection(c1.subdivide()));
            bounding = bounding.union(this.drawSection(c2.subdivide()));
        }
        return bounding;
    }

    finalize() {
        this.collider = new StrokeCollider(this.width, this.vertices);
        this.boundingRect = Rect.boundingRect(this.polygon.vertices.map(([xy, uv]) => xy));
        this.polygon.updateBuffer(true);
    }

    drawSegment(last: Vec2, point: Vec2) {
        const {width} = this;

        const normal = point.sub(last).normal();
        if (normal == undefined) { return Rect.empty; }

        const toLeft = normal.mul(width / 2);
        const toRight = normal.mul(-width / 2);
        const vertices: [Vec2, number][] = [
            [last.add(toLeft), -1],
            [last.add(toRight), 1],
            [point.add(toLeft), -1],
            [point.add(toRight), 1],
        ];
        this.polygon.vertices.push(...vertices);
        return Rect.boundingRect(vertices.map(v => v[0]));
    }

    drawSection(vertices: Vec2[]) {
        let bounding = Rect.empty;
        for (let i = 0; i < vertices.length - 1; ++i) {
            bounding = bounding.union(this.drawSegment(vertices[i], vertices[i + 1]));
        }
        this.vertices.pop();
        this.vertices.push(...vertices);
        this.lastSectionLength = vertices.length - 1;
        this.lastBoundingRect = bounding;
        return bounding;
    }

    rewindLastSection() {
        const count = this.lastSectionLength;
        this.polygon.vertices.splice(-count * 4, count * 4);
        this.vertices.splice(-count, count);
        this.lastSectionLength = 0;
    }

    render(viewportTransform: Transform, sceneTransform: Transform) {
        const {polygon, shader, color, width} = this;
        if (polygon.vertices.length > 0) {
            shader.use();
            shader.transform = sceneTransform.merge(viewportTransform);
            shader.color = color;
            shader.displayWidth = width * sceneTransform.m11;
            polygon.draw();
        }
    }
}
