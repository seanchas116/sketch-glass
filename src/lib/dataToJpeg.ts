import Vec2 from "./geometry/Vec2";

export default
function dataToJpeg(data: Uint8Array, size: Vec2) {
  const canvas = document.createElement("canvas") as HTMLCanvasElement;
  canvas.width = size.width;
  canvas.height = size.height;
  const context = canvas.getContext("2d");
  const imageData = context.createImageData(size.width, size.height);
  imageData.data.set(new Uint8ClampedArray(data), 0);
  context.putImageData(imageData, 0, 0);
  return canvas.toDataURL("image/jpeg").replace(/^data:image\/jpeg;base64,/, "");
}
