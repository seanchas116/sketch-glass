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
  observableArray.values = collaborativeList.asArray().map(mapper);

  collaborativeList.addEventListener(gapi.drive.realtime.EventType.VALUES_ADDED, ({index, values}) => {
    observableArray.insert(index, values.map(mapper));
  });
  collaborativeList.addEventListener(gapi.drive.realtime.EventType.VALUES_REMOVED, ({index, values}) => {
    observableArray.remove(index, values.length);
  });
  collaborativeList.addEventListener(gapi.drive.realtime.EventType.VALUES_SET, ({index, newValues}) => {
    observableArray.replace(index, newValues.map(mapper));
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
