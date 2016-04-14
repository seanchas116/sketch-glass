import Color from "./lib/geometry/Color";

export
class PenSelectedAction {
  constructor(public width: number) {}
}

export
class EraserSelectedAction {
  constructor(public width: number) {}
}

export
class ColorSelectedAction {
  constructor(public color: Color) {}
}

export
class SidebarToggleAction {
}

export
class OpenUserAction {
}

export
class OpenCanvasInfoAction {
}
