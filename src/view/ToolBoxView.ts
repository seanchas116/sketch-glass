import Component from "../lib/ui/Component";
import ButtonView from "./ButtonView";
import Brush, {BrushType} from "../model/Brush";
import Variable from "../lib/rx/Variable";
import ToolBox from "../model/ToolBox";

export default
class ToolBoxView extends Component {
  static template = `
    <div class="sg-palette">
      <div class="pen-button"></div>
      <div class="eraser-button"></div>
    </div>
  `;

  penButton = new ButtonView(this.elementFor(".pen-button"), "pen");
  eraserButton = new ButtonView(this.elementFor(".eraser-button"), "eraser");

  constructor(mountPoint: Element, public toolBox: ToolBox) {
    super(mountPoint);

    this.disposables.add(
      this.penButton.clicked.subscribe(() => {
        toolBox.brush.value = toolBox.pen;
      }),
      this.eraserButton.clicked.subscribe(() => {
        toolBox.brush.value = toolBox.eraser;
      }),
      toolBox.brush.changed
        .map(brush => brush == toolBox.pen)
        .subscribe(this.penButton.isChecked),
      toolBox.brush.changed
        .map(brush => brush == toolBox.eraser)
        .subscribe(this.eraserButton.isChecked)
    );
  }
}
