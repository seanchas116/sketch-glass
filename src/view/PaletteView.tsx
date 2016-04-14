import * as React from "react";
import ButtonView from "./ButtonView";

enum Tool {
  Pen, Eraser
}

interface PaletteState {
  tool: Tool;
  penSize: number;
  eraserSize: number;
}

export default
class PaletteView extends React.Component<void, PaletteState> {
  state = {
    tool: Tool.Pen,
    penSize: 3,
    eraserSize: 10
  };

  render() {
    const {tool} = this.state;
    return (
      <div className="sg-palette">
        <ButtonView kind="pen" checked={tool == Tool.Pen} onClick={() => this.toggleTool(Tool.Pen)} />
        <ButtonView kind="eraser" checked={tool == Tool.Eraser} onClick={() => this.toggleTool(Tool.Eraser)} />
      </div>
    );
  }

  private toggleTool(tool: Tool) {
    this.setState({
      tool: tool,
      penSize: this.state.penSize,
      eraserSize: this.state.eraserSize
    });
  }
}
