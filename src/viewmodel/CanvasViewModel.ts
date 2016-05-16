import Transform from '../lib/geometry/Transform';
import Variable from "../lib/rx/Variable";
import Canvas from "../model/Canvas";
import User from "../model/User";
import CanvasFile from "../model/CanvasFile";
import CanvasFileViewModel from "./CanvasFileViewModel";
import * as Auth from "../Auth";

declare module gapi.drive.share {
    export var ShareClient: any;
}

export default
    class CanvasViewModel {
    transform = new Variable(Transform.identity);
    users = new Variable<User[]>([]);

    constructor(public canvas: Canvas, public fileVM: CanvasFileViewModel) {
        this.fetchUsers();
    }

    async fetchUsers() {
        if (this.canvas.canEdit) {
            this.users.value = await CanvasFile.fetchUsers(this.fileVM.id);
        }
    }
}
