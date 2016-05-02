import Component from "../lib/ui/Component";
import ButtonView from "./ButtonView";
import Tool from "../model/Tool";
import CanvasViewModel from "../viewmodel/CanvasViewModel";

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

  constructor(mountPoint: Element, public canvasViewModel: CanvasViewModel) {
    super(mountPoint);

    this.disposables.add(
      this.penButton.clicked.subscribe(() => {
        canvasViewModel.tool.value = Tool.Pen;
      }),
      this.eraserButton.clicked.subscribe(() => {
        canvasViewModel.tool.value = Tool.Eraser;
      }),
      canvasViewModel.tool.changed
        .map(tool => tool == Tool.Pen)
        .subscribe(this.penButton.isChecked),
      canvasViewModel.tool.changed
        .map(tool => tool == Tool.Eraser)
        .subscribe(this.eraserButton.isChecked)
    );
  }
}
