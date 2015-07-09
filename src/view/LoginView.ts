import * as styles from "./styles";
import * as colors from "./colors";
import {applyStyles} from "./util";

export default
class LoginView {
  element: HTMLElement;

  constructor() {
    const root = this.element = document.createElement("div");
    applyStyles(root, {
      width: "100vw",
      height: "100vh",
      backgroundColor: "rgba(0,0,0,0.1)",
      position: "absolute",
    });

    const frame = document.createElement("div");
    applyStyles(frame, {
      width: "400px",
      height: "480px",
      margin: "auto",
      position: "absolute",
      left: 0,
      right: 0,
      top: 0,
      bottom: 0,
      backgroundColor: colors.white,
      borderRadius: "12px",
    });

    root.appendChild(frame);

    const header = document.createElement("div");
    applyStyles(header, {
      height: "180px",
      borderTopLeftRadius: "12px",
      borderTopRightRadius: "12px",
      backgroundColor: colors.green,
    });

    const title = document.createElement("h1");
    title.appendChild(document.createTextNode("SketchGlass"));
    applyStyles(title, styles.boldFont, {
      fontSize: "30px",
      color: colors.white,
      textAlign: "center",
      margin: "0",
      paddingTop: "60px",
    });
    const subtitle = document.createElement("p");
    subtitle.appendChild(document.createTextNode(`
      Draw & collaborate sketches instantly
    `));
    applyStyles(subtitle, styles.lightFont, {
      fontSize: "18px",
      color: colors.white,
      textAlign: "center",
      margin: "0",
      paddingTop: "6px",
    });

    header.appendChild(title);
    header.appendChild(subtitle);

    const content = document.createElement("div");
    applyStyles(content, {
      height: "300px",
    });

    const getStarted = document.createElement("p");
    getStarted.appendChild(document.createTextNode(`
      Get started now!
    `));
    applyStyles(getStarted, styles.lightFont, {
      margin: "0",
      paddingTop: "48px",
      color: colors.green,
      textAlign: "center",
    });

    content.appendChild(getStarted);

    frame.appendChild(header);
    frame.appendChild(content);
  }

  show() {
    this.element.style.display = "visible";
  }
  hide() {
    this.element.style.display = "hidden";
  }
}
