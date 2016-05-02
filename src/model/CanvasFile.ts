import * as GoogleAPI from "../lib/GoogleAPI";

export default
class CanvasFile {
  constructor(
    public id: string,
    public name: string,
    public thumbnailLink: string
  ) {}

  static async create() {
    const data = await GoogleAPI.post<any>("https://www.googleapis.com/drive/v3/files", {}, {
      appProperties: {
        showInList: true,
      },
      mimeType: "application/vnd.google-apps.drive-sdk"
    });
    return this.fromData(data);
  }

  static fromData(data: any) {
    return new CanvasFile(
      data.id,
      data.name,
      data.thumbnailLink
    );
  }

  static async list() {
    const data = await GoogleAPI.get<any>("https://www.googleapis.com/drive/v3/files", {
      orderBy: "modifiedTime desc",
      q: "appProperties has { key='showInList' and value='true' }"
    });
    return (data.files as any[]).map(d => this.fromData(d));
  }
}
