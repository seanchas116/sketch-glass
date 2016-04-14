import * as React from "react";
import ButtonView from "./ButtonView";

export default
class InfoButtonsView extends React.Component<void, void> {
  render() {
    return (
      <div className="sg-info-buttons">
        <ButtonView kind="info" />
        <ButtonView kind="user" />
      </div>
    );
  }
}
