import Component from "../lib/ui/Component";
import MountPoint from "../lib/ui/MountPoint";
import ButtonView from "./ButtonView";
import ColorDialog from "./ColorDialog";
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
      <div class="color-dialog"></div>
    </div>
  `;

    penButton = new ButtonView(this.mountPointFor(".pen-button"), "pen");
    colorButton = new ColorButtonView(this.mountPointFor(".color-button"));
    eraserButton = new ButtonView(this.mountPointFor(".eraser-button"), "eraser");
    undoButton = new ButtonView(this.mountPointFor(".undo-button"), "undo");
    redoButton = new ButtonView(this.mountPointFor(".redo-button"), "redo");
    colorDialog = new ColorDialog(this.mountPointFor(".color-dialog"));
    buttons = [this.penButton, this.eraserButton, this.undoButton, this.redoButton, this.colorButton];
    isColorsShown = new Variable(false);

    constructor(mountPoint: MountPoint) {
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

        this.subscribeWithDestination<CanvasViewModel | undefined>(appViewModel.canvasViewModel.changed, (canvasVM, dest) => {
            if (canvasVM != undefined) {
                dest.subscribe(canvasVM.canvas.canUndo.changed.map(x => !x), this.undoButton.isDisabled);
                dest.subscribe(canvasVM.canvas.canRedo.changed.map(x => !x), this.redoButton.isDisabled);
            }
        });

        this.subscribe(viewModel.color.changed, this.colorButton.color);

        this.subscribe(this.isColorsShown.changed.map(x => !x), this.colorDialog.slot.isHidden);
        this.subscribe(this.colorButton.clicked, () => {
            this.isColorsShown.value = !this.isColorsShown.value;
        });
        this.subscribe(this.colorDialog.colorSelected, color => {
            viewModel.color.value = color;
            this.isColorsShown.value = false;
        });
        this.subscribe(this.colorDialog.canceled, () => {
            this.isColorsShown.value = false;
        });
    }

    undo() {
        const canvasVM = appViewModel.canvasViewModel.value;
        if (canvasVM) {
            try {
                canvasVM.canvas.undo();
            } catch (error) { }
        }
    }

    redo() {
        const canvasVM = appViewModel.canvasViewModel.value;
        if (canvasVM) {
            try {
                canvasVM.canvas.redo();
            } catch (error) { }
        }
    }
}
