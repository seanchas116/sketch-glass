import * as styles from "./styles";
import * as colors from "./colors";
import {applyStyles} from "./util";

class LoginButtonView {
  element = document.createElement("a");

  constructor(text: string, color: string) {
    this.element.appendChild(document.createTextNode(text));
    applyStyles(this.element, styles.boldFont, {
      width: "300px",
      height: "36px",
      lineHeight: "36px",
      margin: "12px auto",
      borderRadius: "12px",
      color: colors.white,
      backgroundColor: color,
      display: "block",
      textAlign: "center",
      textDecoration: "none",
    });
    this.element.href = "#";
  }
}

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

    const authButtons = document.createElement("div");
    applyStyles(authButtons, {
      paddingTop: "36px",
    });

    const twitterAuthButton = new LoginButtonView("Sign In with Twitter", "#4A90E2");
    authButtons.appendChild(twitterAuthButton.element);

    content.appendChild(authButtons);

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
