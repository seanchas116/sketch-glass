import Component from "../lib/ui/Component";
import ButtonView from "./ButtonView";

export default
class InfoButtonsView extends Component {
  static template = `
    <div class="sg-info-buttons">
      <div class="info-button"></div>
      <div class="user-button"></div>
    </div>
  `;
  infoButton = new ButtonView("info");
  userButton = new ButtonView("user");

  constructor() {
    super();
    this.infoButton.mount(this.elementFor(".info-button"));
    this.userButton.mount(this.elementFor(".user-button"));
  }
}
