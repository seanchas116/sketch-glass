import * as GoogleAPI from "../lib/GoogleAPI";

export default
class CanvasFile {
  id: string;
  name: string;
  modifiedTime: Date;

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
    const file = new CanvasFile();
    file.id = data.id;
    file.name = data.name;
    file.modifiedTime = new Date(data.modifiedTime);
    return file;
  }

  static async list() {
    const data = await GoogleAPI.get<any>("https://www.googleapis.com/drive/v3/files", {
      orderBy: "modifiedTime desc",
      q: "appProperties has { key='showInList' and value='true' } and trashed = false",
      fields: "files(id,modifiedTime,name),kind,nextPageToken"
    });
    return (data.files as any[]).map(d => this.fromData(d));
  }
}
