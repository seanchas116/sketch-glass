
declare namespace gapi.drive.realtime {
  enum Attribute {
    IS_READ_ONLY,
  }

  enum CollaborativeTypes {
    COLLABORATIVE_MAP,
    COLLABORATIVE_LIST,
    COLLABORATIVE_STRING,
    INDEX_REFERENCE,
  }

  enum ErrorType {
    CONCURRENT_CREATION,
    INVALID_COMPOUND_OPERATION,
    INVALID_JSON_SYNTAX,
    MISSING_PROPERTY,
    NOT_FOUND,
    FORBIDDEN,
    SERVER_ERROR,
    CLIENT_ERROR,
    TOKEN_REFRESH_REQUIRED,
    INVALID_ELEMENT_TYPE,
    NO_WRITE_PERMISSION,
  }

  namespace EventType {
    var OBJECT_CHANGED: "object_changed";
    var VALUES_SET: "values_set";
    var VALUES_ADDED: "values_added";
    var VALUES_REMOVED: "values_removed";
    var VALUE_CHANGED: "values_changed";
    var TEXT_INSERTED: "text_inserted";
    var TEXT_DELETED: "text_deleted";
    var COLLABORATOR_JOINED: "collaborator_joined";
    var COLLABORATOR_LEFT: "collaborator_left";
    var REFERENCE_SHIFTED: "reference_shifted";
    var DOCUMENT_SAVE_STATE_CHANGED: "document_save_state_changed";
    var UNDO_REDO_STATE_CHANGED: "undo_redo_state_changed";
    var ATTRIBUTE_CHANGED: "attribute_changed";
  }

  class AttributeChangedEvent {
    attribute: Attribute;
    target: Document;
    value: any;
  }

  class BaseModelEvent {
    bubbles: boolean;
    compoundOperationNames: [string] | string;
    isLocal: boolean;
    isRedo: boolean;
    isUndo: boolean;
    sessionId: string;
    target: Object;
    type: string;
    userId: string;
    preventDefault(): void;
    stopPropagation(): void;
  }

  class CollaborativeList<T> extends CollaborativeObject {
    length: number;
    addEventListener(type: typeof EventType.VALUES_ADDED, listener: (event: ValuesAddedEvent<T>) => void, capture?: boolean): void;
    addEventListener(type: typeof EventType.VALUES_REMOVED, listener: (event: ValuesRemovedEvent<T>) => void, capture?: boolean): void;
    addEventListener(type: typeof EventType.VALUES_SET, listener: (event: ValuesSetEvent<T>) => void, capture?: boolean): void;
    asArray(): T[];
    clear(): void;
    get(index: number): T;
    indexOf(value: T, comparator: (a: T, b: T) => number): number;
    insert(index: number, value: T): void;
    insertAll(index: number, values: T[]): void;
    lastIndexOf(value: T, comparator: (a: T, b: T) => number): number;
    move(index: number, destinationIndex: number): void;
    moveToList(index: number, destination: CollaborativeList<T>, destinationIndex: number): void;
    push(value: T): number;
    pushAll(values: T[]): void;
    registerReference(index: number, deleteMode: IndexReference.DeleteMode): IndexReference;
    remove(index: number): void;
    removeRange(startIndex: number, endIndex: number): void;
    removeValue(value: T): boolean;
    replaceRange(index: number, values: T[]): void;
    set(index: number, value: T): void;
  }

  class CollaborativeMap<T> extends CollaborativeObject {
    size: number;
    addEventListener(type: typeof EventType.VALUE_CHANGED, listener: (event: ValueChangedEvent<T>) => void, capture?: boolean): void;
    clear(): void;
    delete(key: string): T;
    get(key: string): T;
    has(key: string): boolean;
    isEmpty(): boolean;
    items(): [string, T][];
    keys(): string[];
    set(key: string, value: T): T;
    values(): T[];
  }

  class CollaborativeObject extends EventTarget {
    id(): string;
    toString(): string;
    type(): string;
  }

  class CollaborativeString extends CollaborativeObject {
    length: number;
    text: string;
    append(text: string): void;
    getText(): string;
    insertString(index: number, text: string): void;
    registerReference(index: number, deleteMode: IndexReference.DeleteMode): IndexReference;
    removeRange(startIndex: number, endIndex: number): void;
    setText(text: string): void;
  }

  class Collaborator {
    color: string;
    displayName: string;
    isAnonymous: boolean;
    isMe: boolean;
    permissionId: string;
    photoUrl: string;
    sessionId: string;
    userId: string;
  }

  class CollaboratorJoinedEvent {
    collaborator: Collaborator;
    target: Document;
  }

  class CollaboratorLeftEvent {
    collaborator: Collaborator;
    target: Document;
  }

  class Document extends EventTarget {
    isClosed: boolean;
    isInGoogleDrive: boolean;
    saveDelay: number;
    close(): void;
    getCollaborators(): Collaborator[];
    getModel(): Model;
    saveAs(fileId: string): void;
  }

  class DocumentClosedError {
    name: string;
  }

  class DocumentSaveStateChangedEvent {
    isPending: boolean;
    isSaving: boolean;
    target: Document;
  }

  class Error {
    isFatal: boolean;
    message: string;
    type: ErrorType;
    toString(): string;
  }

  class EventTarget {
    addEventListener(type: string, listener: (event: any) => void, capture?: boolean): void;
    removeAllEventListeners(): void;
    removeEventListener(type: string, listener: (event: BaseModelEvent) => void, capture?: boolean): void;
  }

  class IndexReference extends CollaborativeObject {
    index: number;
    addEventListener(type: typeof EventType.REFERENCE_SHIFTED, listener: (event: ReferenceShiftedEvent) => void, capture?: boolean): void;
    deleteMode(): IndexReference.DeleteMode;
    referencedObject(): CollaborativeObject;
  }

  namespace IndexReference {
    enum DeleteMode {
      SHIFT_AFTER_DELETE,
      SHIFT_BEFORE_DELETE,
      SHIFT_TO_INVALID,
    }
  }

  class Model extends EventTarget {
    static beginCreationCompoundOperation(model: Model): void;
    bytesUsed: number;
    canRedo: boolean;
    canUndo: boolean;
    static createJsObject(typeName: string): Object;
    addEventListener(type: typeof EventType.UNDO_REDO_STATE_CHANGED, listener: (event: UndoRedoStateChangedEvent) => void, capture?: boolean): void;
    beginCompoundOperation(name?: string, isUndoable?: boolean): void;
    create(ref: Function | string, args: any[]): CollaborativeObject;
    createList<T>(initialValue?: T[]): CollaborativeList<T>;
    createMap<T>(initialValue?: [string, T][]): CollaborativeMap<T>;
    createString(initialValue?: string): CollaborativeString;
    endCompoundOperation(): void;
    getRoot(): CollaborativeMap<any>;
    isReadOnly(): boolean;
    redo(): void;
    serverRevision(): number;
    toJson(appId?: string, revision?: number): string;
    undo(): void;
  }

  class ObjectChangedEvent extends BaseModelEvent {
    events: BaseModelEvent[];
  }

  class ReferenceShiftedEvent extends BaseModelEvent {
    newIndex: number;
    newObject: CollaborativeObject;
    oldIndex: number;
    oldObject: CollaborativeObject;
  }

  class TextDeletedEvent extends BaseModelEvent {
    index: number;
    text: string;
  }

  class TextInsertedEvent extends BaseModelEvent {
    index: number;
    text: string;
  }

  class UndoRedoStateChangedEvent {
    canRedo: boolean;
    canUndo: boolean;
    target: Model;
  }

  class ValueChangedEvent<T> extends BaseModelEvent {
    newValue: T;
    oldValue: T;
    property: string;
  }

  class ValuesAddedEvent<T> extends BaseModelEvent {
    index: number;
    movedFromIndex: number;
    movedFromList: CollaborativeList<T>;
    values: T[];
  }

  class ValuesRemovedEvent<T> extends BaseModelEvent {
    index: number;
    movedToIndex: number;
    movedToList: CollaborativeList<T>;
    values: T[];
  }

  class ValuesSetEvent<T> extends BaseModelEvent {
    index: number;
    newValues: T[];
    oldValues: T[];
  }

  function debug(): void;
  function enableTestMode(): void;
  function load(
    fileId: string, onLoaded: (document: Document) => void,
    initializerFn?: (model: Model) => void, errorFn?: (error: Error) => void
  ): void;
  function loadFromJson(json: string, errorFn?: (error: Error) => void): void;
  function newInMemoryDocument(
    onLoaded?: (document: Document) => void,
    initializerFn?: (model: Model) => void, errorFn?: (error: Error) => void
  ): void;
}
