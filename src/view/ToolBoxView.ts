import Component from "../lib/ui/Component";
import ButtonView from "./ButtonView";
import Tool from "../model/Tool";
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
        toolBox.tool.value = Tool.Pen;
      }),
      this.eraserButton.clicked.subscribe(() => {
        toolBox.tool.value = Tool.Eraser;
      }),
      toolBox.tool.changed
        .map(tool => tool == Tool.Pen)
        .subscribe(this.penButton.isChecked),
      toolBox.tool.changed
        .map(tool => tool == Tool.Eraser)
        .subscribe(this.eraserButton.isChecked)
    );
  }
}
