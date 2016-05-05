import Component from "../lib/ui/Component";
import ButtonView from "./ButtonView";
import Tool from "../model/Tool";
import CanvasViewModel from "../viewmodel/CanvasViewModel";
import DisposableBag from "../lib/DisposableBag";
import Variable from "../lib/rx/Variable";

export default
class ToolBoxView extends Component {
  static template = `
    <div class="sg-palette">
      <div class="pen-button"></div>
      <div class="eraser-button"></div>
      <div class="undo-button"></div>
      <div class="redo-button"></div>
    </div>
  `;

  penButton = new ButtonView(this.elementFor(".pen-button"), "pen");
  eraserButton = new ButtonView(this.elementFor(".eraser-button"), "eraser");
  undoButton = new ButtonView(this.elementFor(".undo-button"), "undo");
  redoButton = new ButtonView(this.elementFor(".redo-button"), "redo");
  canvasViewModel = new Variable<CanvasViewModel | undefined>(undefined);
  canvasDisposables = new DisposableBag();

  constructor(mountPoint: Element) {
    super(mountPoint);

    this.disposables.add(this.canvasDisposables);

    this.canvasViewModel.observable.subscribe(vm => {
      this.canvasDisposables.clear();
      if (vm != undefined) {
        // FIXME: directly using vm doesn't work
        const viewModel = vm;
        this.canvasDisposables.add(
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
            .subscribe(this.eraserButton.isChecked)
        );
      }
    });
  }
}
