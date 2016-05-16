import Stroke, {StrokeData} from './Stroke';
import Transform from '../lib/geometry/Transform';
import Variable from "../lib/rx/Variable";
import CanvasFile from "./CanvasFile";
import * as Rx from "rx";

function initModel(model: gapi.drive.realtime.Model) {
    model.getRoot().set("shapes", model.createMap());
}

function loadDocument(fileId: string) {
    return new Promise<gapi.drive.realtime.Document>((resolve, reject) => {
        gapi.drive.realtime.load(fileId, resolve, initModel, reject);
    });
}

export default
    class Canvas {
    strokes = new Variable<Stroke[]>([]);
    strokeDataMap: gapi.drive.realtime.CollaborativeMap<StrokeData>;
    canUndo = new Variable(false);
    canRedo = new Variable(false);
    editedInLocal = new Rx.Subject<void>();
    editedInRemote = new Rx.Subject<void>();

    constructor(public file: CanvasFile, public document: gapi.drive.realtime.Document) {
        this.strokeDataMap = document.getModel().getRoot().get("shapes") as gapi.drive.realtime.CollaborativeMap<StrokeData>;
        this.strokeDataMap.addEventListener(gapi.drive.realtime.EventType.VALUE_CHANGED, (event) => {
            this.updateStroke();
            if (event.isLocal && !event.isUndo && !event.isRedo) {
                this.editedInLocal.onNext(undefined);
            } else {
                this.editedInRemote.onNext(undefined);
            }
        });
        this.updateCanUndoRedo();
        this.updateStroke();
    }

    updateStroke() {
        this.strokes.value = this.strokeDataMap.values()
            .map(data => Stroke.fromData(data))
            .sort((a, b) => a.createdAt.valueOf() - b.createdAt.valueOf());
    }

    pushStroke(stroke: Stroke) {
        this.strokeDataMap.set(stroke.id, stroke.toData());
        this.updateCanUndoRedo();
    }

    deleteStroke(stroke: Stroke) {
        let index = -1;
        this.strokeDataMap.delete(stroke.id);
        this.updateCanUndoRedo();
    }

    undo() {
        this.document.getModel().undo();
        this.updateCanUndoRedo();
    }

    redo() {
        this.document.getModel().redo();
        this.updateCanUndoRedo();
    }

    updateCanUndoRedo() {
        this.canUndo.value = this.document.getModel().canUndo;
        this.canRedo.value = this.document.getModel().canRedo;
    }

    static async fromFile(file: CanvasFile) {
        const document = await loadDocument(file.id);
        return new Canvas(file, document);
    }
}
