
export default
class LoginView {
  element: HTMLElement;

  constructor() {
    const root = this.element = document.createElement("div");
    Object.assign(root.style, {
      width: "100vw",
      height: "100vh",
      backgroundColor: "rgba(0,0,0,0.1)",
      position: "absolute",
    });

    const frame = document.createElement("div");
    Object.assign(frame.style, {
      width: "400px",
      height: "480px",
      margin: "auto",
      position: "absolute",
      left: 0,
      right: 0,
      top: 0,
      bottom: 0,
      backgroundColor: "#FFFFFF",
      borderRadius: "12px",
    });

    root.appendChild(frame);

    const header = document.createElement("div");
    Object.assign(header.style, {
      height: "180px",
      borderTopLeftRadius: "12px",
      borderTopRightRadius: "12px",
      backgroundColor: "#80D8B1",
    });

    const title = document.createElement("h1");
    title.appendChild(document.createTextNode("SketchGlass"));
    Object.assign(title.style, {
      fontSize: "30px",
      color: "#FFFFFF",
      textAlign: "center",
      margin: "0",
      paddingTop: "60px",
      fontWeight: "500",
    });
    const subtitle = document.createElement("p");
    subtitle.appendChild(document.createTextNode(`
      Draw & collaborate sketches instantly
    `));
    Object.assign(subtitle.style, {
      fontSize: "18px",
      color: "#FFFFFF",
      textAlign: "center",
      margin: "0",
      paddingTop: "6px",
      fontWeight: "100",
    });

    header.appendChild(title);
    header.appendChild(subtitle);

    const content = document.createElement("div");
    Object.assign(content.style, {
      height: "300px",
    });

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
