import Component from "../lib/ui/Component";
import ButtonView from "./ButtonView";
import Tool from "../model/Tool";
import Variable from "../lib/rx/Variable";
import ColorButtonView from "./ColorButtonView";
import DisposableBag from "../lib/DisposableBag";
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
  canvasDisposables = new DisposableBag();

  constructor(mountPoint: Element) {
    super(mountPoint);

    const viewModel = appViewModel.toolBoxViewModel;

    this.disposables.add(
      this.canvasDisposables,
      ...this.buttons.map(button =>
        appViewModel.isLoading.observable.subscribe(button.isDisabled)
      )
    );

    this.disposables.add(
      this.penButton.clicked.subscribe(() => {
        viewModel.tool.value = Tool.Pen;
      }),
      this.eraserButton.clicked.subscribe(() => {
        viewModel.tool.value = Tool.Eraser;
      }),
      viewModel.tool.observable
        .map(tool => tool == Tool.Pen)
        .subscribe(this.penButton.isChecked),
      viewModel.tool.observable
        .map(tool => tool == Tool.Eraser)
        .subscribe(this.eraserButton.isChecked),
      this.undoButton.clicked.subscribe(() => {
        this.undo();
      }),
      this.redoButton.clicked.subscribe(() => {
        this.redo();
      }),
      appViewModel.canvasViewModel.observable.subscribe(canvasVM => {
        this.canvasDisposables.clear();
        if (canvasVM != undefined) {
          this.canvasDisposables.add(
            canvasVM.canvas.canUndo.observable.map(x => !x).subscribe(this.undoButton.isDisabled),
            canvasVM.canvas.canRedo.observable.map(x => !x).subscribe(this.redoButton.isDisabled)
          );
        }
      })
    );
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
