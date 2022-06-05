import { MenuItem } from "@seanchas116/paintkit/src/components/menu/Menu";
import { JSONUndoHistory } from "@seanchas116/paintkit/src/util/JSONUndoHistory";
import { KeyGesture } from "@seanchas116/paintkit/src/util/KeyGesture";
import { action, computed, makeObservable, observable } from "mobx";
import { DocumentJSON, Document } from "../models/Document";
import { EditorState } from "../state/EditorState";
import { File } from "./File";

class TabEditorState extends EditorState {
  constructor(file: File) {
    super();
    this.file = file;
  }

  readonly file: File;

  get history(): JSONUndoHistory<DocumentJSON, Document> {
    return this.file.history;
  }
}

export class TabState {
  constructor() {}

  file = new File();
  editorState = new TabEditorState(this.file);
}

export class AppState {
  constructor() {
    makeObservable(this);
  }

  readonly tabStates = observable.array<TabState>();
  @observable currentTabStateIndex = 0;

  @computed get currentTabState(): TabState | undefined {
    return this.tabStates[this.currentTabStateIndex];
  }

  getFileMenu(): MenuItem[] {
    return [
      {
        text: "New",
        shortcut: [new KeyGesture(["Command"], "KeyN")],
        onClick: action(() => {
          this.tabStates.push(new TabState());
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
          const tabState = new TabState();
          void tabState.file.open().then(
            action(() => {
              this.tabStates.push(tabState);
            })
          );
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
          void this.currentTabState?.file.save();
          return true;
        }),
      },
      {
        text: "Save As...",
        shortcut: [new KeyGesture(["Shift", "Command"], "KeyS")],
        onClick: action(() => {
          void this.currentTabState?.file.saveAs();
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
      ...(this.currentTabState?.editorState.getMainMenu() ?? []),
    ];
  }
}
