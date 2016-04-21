
export
function toggleClass(element: Element, klass: string, value: boolean) {
  const classes = new Set(element.className.split(" "));
  if (value) {
    classes.add(klass);
  } else {
    classes.delete(klass);
  }
  element.className = Array.from(classes).join(" ");
}
