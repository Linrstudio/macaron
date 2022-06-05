import { MenuItem } from "@seanchas116/paintkit/src/components/menu/Menu";
import { JSONUndoHistory } from "@seanchas116/paintkit/src/util/JSONUndoHistory";
import { KeyGesture } from "@seanchas116/paintkit/src/util/KeyGesture";
import { action, makeObservable } from "mobx";
import { DocumentJSON, Document } from "../models/Document";
import { EditorState } from "../state/EditorState";
import { File } from "./File";
import { FileList } from "./FileList";

class FileEditorState extends EditorState {
  private static instances = new WeakMap<File, FileEditorState>();

  static get(file: File): FileEditorState {
    return FileEditorState.instances.get(file) ?? new FileEditorState(file);
  }

  private constructor(file: File) {
    super();
    this.file = file;
    FileEditorState.instances.set(file, this);
  }

  readonly file: File;

  get history(): JSONUndoHistory<DocumentJSON, Document> {
    return this.file.history;
  }
}

export class AppState {
  constructor(fileList: FileList) {
    makeObservable(this);
    this.fileList = fileList;
  }

  readonly fileList: FileList;

  get currentEditorState(): FileEditorState | undefined {
    const file = this.fileList.currentFile;
    if (file) {
      return FileEditorState.get(file);
    }
  }

  getFileMenu(): MenuItem[] {
    return [
      {
        text: "New",
        shortcut: [new KeyGesture(["Command"], "KeyN")],
        onClick: action(() => {
          void this.fileList.newFile();
          return true;
        }),
      },
      {
        type: "separator",
      },
      {
        text: "Open...",
        shortcut: [new KeyGesture(["Command"], "KeyO")],
        onClick: action(() => {
          void this.fileList.openFile();
          return true;
        }),
      },
      {
        type: "separator",
      },
      {
        text: "Save",
        shortcut: [new KeyGesture(["Command"], "KeyS")],
        onClick: action(() => {
          void this.fileList.currentFile?.save();
          return true;
        }),
      },
      {
        text: "Save As...",
        shortcut: [new KeyGesture(["Shift", "Command"], "KeyS")],
        onClick: action(() => {
          void this.fileList.currentFile?.saveAs();
          return true;
        }),
      },
    ];
  }

  getMenu(): MenuItem[] {
    return [
      {
        text: "File",
        children: this.getFileMenu(),
      },
      ...(this.currentEditorState?.getMainMenu() ?? []),
    ];
  }
}
