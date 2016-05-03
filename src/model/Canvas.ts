import Stroke, {StrokeData} from './Stroke';
import Transform from '../lib/geometry/Transform';
import Variable from "../lib/rx/Variable";
import ObservableArray from "../lib/rx/ObservableArray";
import CanvasFile from "./CanvasFile";

function initModel(model: gapi.drive.realtime.Model) {
  model.getRoot().set("shapes", model.createList());
}

function loadDocument(fileId: string) {
  return new Promise<gapi.drive.realtime.Document>((resolve, reject) => {
    gapi.drive.realtime.load(fileId, resolve, initModel, reject);
  });
}

function mapToObservableArray<TData, TValue>(
  collaborativeList: gapi.drive.realtime.CollaborativeList<TData>,
  observableArray: ObservableArray<TValue>,
  mapper: (data: TData) => TValue
) {
  const initValues = collaborativeList.asArray();
  console.log("init values", initValues);
  observableArray.values = initValues.map(mapper);

  collaborativeList.addEventListener(gapi.drive.realtime.EventType.VALUES_ADDED, (event) => {
    console.log("values added", event.index, event.values);
    observableArray.insert(event.index, event.values.map(mapper));
  });
  collaborativeList.addEventListener(gapi.drive.realtime.EventType.VALUES_REMOVED, (event) => {
    console.log("values removed", event.index, event.values);
    observableArray.remove(event.index, event.values.length);
  });
  collaborativeList.addEventListener(gapi.drive.realtime.EventType.VALUES_SET, (event) => {
    console.log("values set", event.index, event.newValues, event.oldValues);
    observableArray.replace(event.index, event.newValues.map(mapper));
  });
}

export default
class Canvas {
  strokes = new ObservableArray<Stroke>([]);
  strokeDataList: gapi.drive.realtime.CollaborativeList<StrokeData>;

  constructor(public document: gapi.drive.realtime.Document) {
    this.strokeDataList = document.getModel().getRoot().get("shapes") as gapi.drive.realtime.CollaborativeList<StrokeData>;
    mapToObservableArray(this.strokeDataList, this.strokes, (data) => Stroke.fromData(data));
  }

  pushStroke(stroke: Stroke) {
    this.strokeDataList.push(stroke.toData());
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
  }

  static async fromFile(file: CanvasFile) {
    const document = await loadDocument(file.id);
    return new Canvas(document);
  }
}
