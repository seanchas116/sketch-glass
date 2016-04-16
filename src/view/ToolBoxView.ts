import Component from "../lib/ui/Component";
import ButtonView from "./ButtonView";
import Tool from "../model/Tool";
import Variable from "../lib/rx/Variable";

export default
class ToolBoxView extends Component {
  static template = `
    <div class="sg-palette">
      <div class="pen-button"></div>
      <div class="eraser-button"></div>
    </div>
  `;

  tool = new Variable(Tool.Pen);
  penSize = new Variable(3);
  eraserSize = new Variable(10);

  penButton = new ButtonView("pen");
  eraserButton = new ButtonView("eraser");

  constructor() {
    super();
    this.penButton.mount(this.elementFor(".pen-button"));
    this.eraserButton.mount(this.elementFor(".eraser-button"));

    this.penButton.clicked.subscribe(() => {
      this.tool.value = Tool.Pen;
    });
    this.eraserButton.clicked.subscribe(() => {
      this.tool.value = Tool.Eraser;
    });
    this.tool.changed
      .map(tool => tool == Tool.Pen)
      .subscribe(this.penButton.isChecked);
    this.tool.changed
      .map(tool => tool == Tool.Eraser)
      .subscribe(this.eraserButton.isChecked);
  }
}
