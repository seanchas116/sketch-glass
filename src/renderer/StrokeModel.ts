import Stroke from "../model/Stroke";
import Polygon from "./Polygon";
import Vec2 from "../lib/geometry/Vec2";
import Curve from "../lib/geometry/Curve";
import StrokeCollider from "./StrokeCollider";
import StrokeShader from "./StrokeShader";
import Model from "./Model";
import Transform from "../lib/geometry/Transform";
import Rect from "../lib/geometry/Rect";

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

    constructor(public gl: WebGLRenderingContext, public shader: StrokeShader, public stroke: Stroke) {
        for (const pos of stroke.points) {
            this.drawPoint(pos);
        }
    }

    dispose() {
        if (!this.isDisposed) {
            console.log("disposing stroke model");
            this.polygon.dispose();
            this.isDisposed = true;
        }
    }

    addPoint(pos: Vec2) {
        this.stroke.points.push(pos);
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
            bounding = bounding.union(this.drawSection(Curve.bSpline(points[0], points[0], points[1], points[2]).subdivide()));
            bounding = bounding.union(this.drawSection(Curve.bSpline(points[0], points[1], points[2], points[2]).subdivide()));
        } else if (nPoints > 3) {
            this.rewindLastSection();
            bounding = bounding.union(this.drawSection(Curve.bSpline(points[nPoints - 4], points[nPoints - 3], points[nPoints - 2], points[nPoints - 1]).subdivide()));
            bounding = bounding.union(this.drawSection(Curve.bSpline(points[nPoints - 3], points[nPoints - 2], points[nPoints - 1], points[nPoints - 1]).subdivide()));
        }
        return bounding;
    }

    finalize() {
        this.collider = new StrokeCollider(this.stroke.width, this.vertices);
        this.boundingRect = Rect.boundingRect(this.polygon.vertices.map(([xy, uv]) => xy));
        this.polygon.updateBuffer(true);
    }

    drawSegment(last: Vec2, point: Vec2) {
        const {width} = this.stroke;

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
        const {polygon, shader, stroke} = this;
        if (polygon.vertices.length > 0) {
            shader.use();
            shader.transform = sceneTransform.merge(viewportTransform);
            shader.color = stroke.color;
            shader.displayWidth = stroke.width * sceneTransform.m11;
            polygon.draw();
        }
    }
}
