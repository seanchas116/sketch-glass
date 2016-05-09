import * as GoogleAPI from "../lib/GoogleAPI";
import User from "./User";

interface CanvasFileInitData {
  id: string;
  name: string;
  modifiedTime: Date;
}

export default
class CanvasFile {
  id: string;
  name: string;
  modifiedTime: Date;

  constructor(data: CanvasFileInitData) {
    this.id = data.id;
    this.name = data.name;
    this.modifiedTime = data.modifiedTime;
  }

  async fetchUsers() {
    const data = await GoogleAPI.get<any>(`https://www.googleapis.com/drive/v3/files/${this.id}/permissions`, {
      fields: "permissions(displayName,id,photoLink)"
    });
    return (data.permissions as any[]).map(p => {
      return new User({
        permissionId: p.id,
        displayName: p.displayName,
        photoLink: p.photoLink,
      });
    });
  }

  static empty() {
    return new CanvasFile({
      id: "", name: "", modifiedTime: new Date()
    });
  }

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
    return new CanvasFile({
      id: data.id,
      name: data.name,
      modifiedTime: new Date(data.modifiedTime),
    });
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
