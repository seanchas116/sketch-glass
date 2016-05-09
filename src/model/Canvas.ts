import Stroke, {StrokeData} from './Stroke';
import Transform from '../lib/geometry/Transform';
import Variable from "../lib/rx/Variable";
import CanvasFile from "./CanvasFile";
import * as Rx from "rx";

function initModel(model: gapi.drive.realtime.Model) {
  model.getRoot().set("shapes", model.createList());
}

function loadDocument(fileId: string) {
  return new Promise<gapi.drive.realtime.Document>((resolve, reject) => {
    gapi.drive.realtime.load(fileId, resolve, initModel, reject);
  });
}

function observableFromCollaborativeList<T>(list: gapi.drive.realtime.CollaborativeList<T>) {
  return Rx.Observable.create<T[]>(observer => {
    const next = () => {
      observer.onNext(list.asArray());
    };
    next();
    list.addEventListener(gapi.drive.realtime.EventType.VALUES_ADDED, next);
    list.addEventListener(gapi.drive.realtime.EventType.VALUES_REMOVED, next);
    list.addEventListener(gapi.drive.realtime.EventType.VALUES_SET, next);
  });
}

export default
class Canvas {
  strokes = new Variable<Stroke[]>([]);
  strokeDataList: gapi.drive.realtime.CollaborativeList<StrokeData>;
  canUndo = new Variable(false);
  canRedo = new Variable(false);

  constructor(public file: CanvasFile, public document: gapi.drive.realtime.Document) {
    this.strokeDataList = document.getModel().getRoot().get("shapes") as gapi.drive.realtime.CollaborativeList<StrokeData>;
    observableFromCollaborativeList(this.strokeDataList)
      .map(list => list.map(data => Stroke.fromData(data)))
      .subscribe(this.strokes);
    this.updateCanUndoRedo();
  }

  pushStroke(stroke: Stroke) {
    this.strokeDataList.push(stroke.toData());
    this.updateCanUndoRedo();
  }

  deleteStroke(stroke: Stroke) {
    let index = -1;
    for (let i = 0; i < this.strokeDataList.length; ++i) {
      if (this.strokeDataList.get(i).id == stroke.id) {
        index = i;
        break;
      }
    }
    if (index >= 0) {
      this.strokeDataList.remove(index);
    }
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
