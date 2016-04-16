import Component from "../lib/ui/Component";
import ButtonView from "./ButtonView";
import Tool from "../model/Tool";
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

  penButton = new ButtonView("pen");
  eraserButton = new ButtonView("eraser");

  constructor(public toolBox: ToolBox) {
    super();
    this.penButton.mount(this.elementFor(".pen-button"));
    this.eraserButton.mount(this.elementFor(".eraser-button"));

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
