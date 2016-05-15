import Component from "../lib/ui/Component";
import MountPoint from "../lib/ui/MountPoint";
import Color from "../lib/geometry/Color";
import * as Rx from "rx";

export default
class ColorDialog extends Component {
    static template = `
        <div class='sg-color-dialog'>
            <div class='arrow'></div>
        </div>
    `;

    colorSelected = new Rx.Subject<Color>();

    constructor(mountPoint: MountPoint) {
        super(mountPoint);

        const palette = [0,1,2,3,4,5].map(x => 60 * x - 10).map(hue => [
            Color.fromHSV(hue, 85, 60),
            Color.fromHSV(hue, 85, 90),
        ]);
        const grays = [75, 50, 25, 0].map(v => Color.fromHSV(0, 0, v));
        const colors = [
            grays[0], palette[0][0], palette[1][0], palette[2][0],
            grays[1], palette[0][1], palette[1][1], palette[2][1],
            grays[2], palette[3][0], palette[4][0], palette[5][0],
            grays[3], palette[3][1], palette[4][1], palette[5][1],
        ];

        for (let y = 0; y < 4; ++y) {
            const row = document.createElement("div");
            row.className = "row";
            for (let x = 0; x < 4; ++x) {
                const cell = document.createElement("div");
                cell.className = "cell";
                const color = colors[y * 4 + x];
                cell.style.backgroundColor = color.toString();
                cell.addEventListener("click", () => {
                    this.colorSelected.onNext(color);
                });
                row.appendChild(cell);
            }
            this.element.appendChild(row);
        }
    }
}
