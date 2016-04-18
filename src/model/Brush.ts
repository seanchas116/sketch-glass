export
enum BrushType {
  Pen, Eraser
}

export default
class Brush {
  // widthGrowth - additional width by stroke speed (px / ms)
  constructor(public type: BrushType, public width: number, public widthGrowth: number) {
  }
}
