"use strict";
var Point_1 = require("./Point");
var Line = (function () {
    function Line(a, b, c) {
        this.a = a;
        this.b = b;
        this.c = c;
    }
    Object.defineProperty(Line.prototype, "normal", {
        get: function () {
            return new Point_1.default(this.a, this.b);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Line.prototype, "direction", {
        get: function () {
            return this.normal.rotate270();
        },
        enumerable: true,
        configurable: true
    });
    Line.prototype.intersection = function (other, fallback) {
        var a1 = this.a;
        var b1 = this.b;
        var c1 = this.c;
        var a2 = other.a;
        var b2 = other.b;
        var c2 = other.c;
        var det = a1 * b2 - b1 * a2;
        if (det === 0) {
            if (fallback != null) {
                return fallback;
            }
            else {
                console.warn("no intersection point for " + this + " and " + other);
                return new Point_1.default(0, 0);
            }
        }
        return new Point_1.default(b2 * c1 - b1 * c2, a1 * c2 - a2 * c1).div(det);
    };
    Line.prototype.signedDistance = function (p) {
        return this.normal.dot(p) - this.c;
    };
    Line.prototype.bisector = function (other, fallback) {
        var i = this.intersection(other, null);
        if (!i) {
            if (fallback != null) {
                return fallback;
            }
            else {
                console.warn("no bisector line for " + this + " and " + other);
                return new Line(1, 0, 0);
            }
        }
        var n = this.normal.add(other.normal).normalize();
        var d = n.dot(i);
        return new Line(n.x, n.y, d);
    };
    Line.prototype.translate = function (d) {
        return new Line(this.a, this.b, this.c + d);
    };
    Line.prototype.toString = function () {
        return "Line(" + this.a + "x + " + this.b + "y = " + this.c + ")";
    };
    Line.fromPointAndNormal = function (p, n) {
        return new Line(n.x, n.y, n.dot(p));
    };
    Line.fromTwoPoints = function (p1, p2) {
        var n = p2.sub(p1).normalize().rotate90();
        return this.fromPointAndNormal(p1, n);
    };
    return Line;
}());
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = Line;
