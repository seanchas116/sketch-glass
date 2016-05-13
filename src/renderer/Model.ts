import Transform from "../lib/geometry/Transform";

interface Model {
    render(viewportTransform: Transform, sceneTransform: Transform): void;
}

export default Model;
