import * as GoogleAPI from "../lib/GoogleAPI";
import User from "./User";
const base64url = require("base64url");

interface CanvasFileInitData {
    id: string;
    name: string;
    modifiedTime: Date;
    thumbnailLink: string;
}

export default
    class CanvasFile {
    id: string;
    name: string;
    modifiedTime: Date;
    thumbnailLink: string;

    constructor(data: CanvasFileInitData) {
        this.id = data.id;
        this.name = data.name;
        this.modifiedTime = data.modifiedTime;
        this.thumbnailLink = data.thumbnailLink;
    }

    static async rename(id: string, newName: string) {
        await GoogleAPI.patch(`https://www.googleapis.com/drive/v3/files/${id}`, {}, {
            name: newName
        });
    }

    static async updateThumbnail(id: string, base64: string) {
        await GoogleAPI.patch(`https://www.googleapis.com/drive/v3/files/${id}`, {}, {
            contentHints: {
                thumbnail: {
                    image: base64url.fromBase64(base64),
                    mimeType: "image/jpeg"
                }
            }
        });
    }

    static async fetchUsers(id: string) {
        const data = await GoogleAPI.get<any>(`https://www.googleapis.com/drive/v3/files/${id}/permissions`, {
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
            id: "", name: "", modifiedTime: new Date(), thumbnailLink: ""
        });
    }

    static async create(name: string) {
        const data = await GoogleAPI.post<any>("https://www.googleapis.com/drive/v3/files", {}, {
            appProperties: {
                showInList: true,
            },
            mimeType: "application/vnd.google-apps.drive-sdk",
            name,
            description: "Created by sketch-glass",
        });
        return this.fromData(data);
    }

    static fromData(data: any) {
        return new CanvasFile({
            id: data.id,
            name: data.name,
            modifiedTime: new Date(data.modifiedTime),
            thumbnailLink: data.thumbnailLink
        });
    }

    static async list() {
        const data = await GoogleAPI.get<any>("https://www.googleapis.com/drive/v3/files", {
            orderBy: "modifiedTime desc",
            q: "appProperties has { key='showInList' and value='true' } and trashed = false",
            fields: "files(id,modifiedTime,name,thumbnailLink),kind,nextPageToken"
        });
        return (data.files as any[]).map(d => this.fromData(d));
    }
}
