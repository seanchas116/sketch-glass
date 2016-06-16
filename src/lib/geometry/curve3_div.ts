import Vec2 from "./Vec2";

const curve_distance_epsilon = 1e-30;
const curve_collinearity_epsilon = 1e-30;
const curve_angle_tolerance_epsilon = 0.01;
const curve_recursion_limit = 32;

function calc_sq_distance(x1: number, y1: number, x2: number, y2: number) {
    const dx = x2 - x1;
    const dy = y2 - y1;
    return dx * dx + dy * dy;
}

export default
class curve3_div {
    approximation_scale = 1;
    distance_tolerance_square: number;
    angle_tolerance = 0;
    points: Vec2[] = [];

    constructor(p1: Vec2, p2: Vec2, p3: Vec2) {
        this.distance_tolerance_square = 0.5 / this.approximation_scale;
        this.distance_tolerance_square *= this.distance_tolerance_square;
        this.bezier(p1.x, p1.y, p2.x, p2.y, p3.x, p3.y);
    }

    recursive_bezier(x1: number, y1: number,
                     x2: number, y2: number,
                     x3: number, y3: number,
                     level: number)
    {
        if(level > curve_recursion_limit)
        {
            return;
        }

        // Calculate all the mid-points of the line segments
        //----------------------
        let x12   = (x1 + x2) / 2;
        let y12   = (y1 + y2) / 2;
        let x23   = (x2 + x3) / 2;
        let y23   = (y2 + y3) / 2;
        let x123  = (x12 + x23) / 2;
        let y123  = (y12 + y23) / 2;

        let dx = x3-x1;
        let dy = y3-y1;
        let d = Math.abs(((x2 - x3) * dy - (y2 - y3) * dx));
        let da: number;

        if(d > curve_collinearity_epsilon)
        {
            // Regular case
            //-----------------
            if(d * d <= this.distance_tolerance_square * (dx*dx + dy*dy))
            {
                // If the curvature doesn't exceed the distance_tolerance value
                // we tend to finish subdivisions.
                //----------------------
                if(this.angle_tolerance < curve_angle_tolerance_epsilon)
                {
                    this.points.push(new Vec2(x123, y123));
                    return;
                }

                // Angle & Cusp Condition
                //----------------------
                da = Math.abs(Math.atan2(y3 - y2, x3 - x2) - Math.atan2(y2 - y1, x2 - x1));
                if(da >= Math.PI) da = 2*Math.PI - da;

                if(da < this.angle_tolerance)
                {
                    // Finally we can stop the recursion
                    //----------------------
                    this.points.push(new Vec2(x123, y123));
                    return;
                }
            }
        }
        else
        {
            // Collinear case
            //------------------
            da = dx*dx + dy*dy;
            if(da == 0)
            {
                d = calc_sq_distance(x1, y1, x2, y2);
            }
            else
            {
                d = ((x2 - x1)*dx + (y2 - y1)*dy) / da;
                if(d > 0 && d < 1)
                {
                    // Simple collinear case, 1---2---3
                    // We can leave just two endpoints
                    return;
                }
                     if(d <= 0) d = calc_sq_distance(x2, y2, x1, y1);
                else if(d >= 1) d = calc_sq_distance(x2, y2, x3, y3);
                else            d = calc_sq_distance(x2, y2, x1 + d*dx, y1 + d*dy);
            }
            if(d < this.distance_tolerance_square)
            {
                this.points.push(new Vec2(x2, y2));
                return;
            }
        }

        // Continue subdivision
        //----------------------
        this.recursive_bezier(x1, y1, x12, y12, x123, y123, level + 1);
        this.recursive_bezier(x123, y123, x23, y23, x3, y3, level + 1);
    }

    bezier(x1: number, y1: number,
           x2: number, y2: number,
           x3: number, y3: number)
    {
        this.points.push(new Vec2(x1, y1));
        this.recursive_bezier(x1, y1, x2, y2, x3, y3, 0);
        this.points.push(new Vec2(x3, y3));
    }
}
