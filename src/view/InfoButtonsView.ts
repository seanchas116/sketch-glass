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
  infoButton = new ButtonView(this.elementFor(".info-button"), "info");
  userButton = new ButtonView(this.elementFor(".user-button"),"user");

  constructor(mountPoint: Element) {
    super(mountPoint);
  }
}
