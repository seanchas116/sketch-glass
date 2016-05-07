import Component from "../lib/ui/Component";
import ButtonView from "./ButtonView";
import Tool from "../model/Tool";
import Variable from "../lib/rx/Variable";
import ColorButtonView from "./ColorButtonView";
import CanvasViewModel from "../viewmodel/CanvasViewModel";
import {appViewModel} from "../viewmodel/AppViewModel";

export default
class ToolBoxView extends Component {
  static template = `
    <div class="sg-palette">
      <div class="pen-button"></div>
      <div class="eraser-button"></div>
      <div class="color-button"></div>
      <div class="undo-button"></div>
      <div class="redo-button"></div>
    </div>
  `;

  penButton = new ButtonView(this.elementFor(".pen-button"), "pen");
  colorButton = new ColorButtonView(this.elementFor(".color-button"));
  eraserButton = new ButtonView(this.elementFor(".eraser-button"), "eraser");
  undoButton = new ButtonView(this.elementFor(".undo-button"), "undo");
  redoButton = new ButtonView(this.elementFor(".redo-button"), "redo");
  buttons = [this.penButton, this.eraserButton, this.undoButton, this.redoButton, this.colorButton];

  constructor(mountPoint: Element) {
    super(mountPoint);

    const viewModel = appViewModel.toolBoxViewModel;

    for (const button of this.buttons) {
      this.subscribe(appViewModel.isLoading.changed, button.isDisabled);
    }

    this.subscribe(this.penButton.clicked, () => {
      viewModel.tool.value = Tool.Pen;
    });
    this.subscribe(this.eraserButton.clicked, () => {
      viewModel.tool.value = Tool.Eraser;
    });

    this.subscribe(viewModel.tool.changed.map(tool => tool == Tool.Pen), this.penButton.isChecked);
    this.subscribe(viewModel.tool.changed.map(tool => tool == Tool.Eraser), this.eraserButton.isChecked);
    this.subscribe(this.undoButton.clicked, () => {
      this.undo();
    });
    this.subscribe(this.redoButton.clicked, () => {
      this.redo();
    });

    this.subscribeWithDestination<CanvasViewModel|undefined>(appViewModel.canvasViewModel.changed, (canvasVM, dest) => {
      if (canvasVM != undefined) {
        dest.subscribe(canvasVM.canvas.canUndo.changed.map(x => !x), this.undoButton.isDisabled);
        dest.subscribe(canvasVM.canvas.canRedo.changed.map(x => !x), this.redoButton.isDisabled);
      }
    });
  }

  undo() {
    const canvasVM = appViewModel.canvasViewModel.value;
    if (canvasVM) {
      try {
        canvasVM.canvas.undo();
      } catch (error) {}
    }
  }

  redo() {
    const canvasVM = appViewModel.canvasViewModel.value;
    if (canvasVM) {
      try {
        canvasVM.canvas.redo();
      } catch (error) {}
    }
  }
}
