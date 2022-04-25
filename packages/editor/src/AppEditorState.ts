import { MenuItem } from "@seanchas116/paintkit/dist/components/menu/Menu";
import { KeyGesture } from "@seanchas116/paintkit/src/util/KeyGesture";
import { action, computed } from "mobx";
import { File } from "./File";
import { EditorState } from "./state/EditorState";

export class AppEditorState extends EditorState {
  constructor(file: File) {
    super(() => file.history);
    this.file = file;
  }

  readonly file: File;

  @computed get windowTitle(): string {
    return `${this.file.history.isModified ? "*" : ""}${
      this.file.fileName
    } - Macaron`;
  }

  getFileMenu(): MenuItem[] {
    return [
      {
        text: "New",
        shortcut: [new KeyGesture(["Command"], "KeyN")],
        run: action(() => {
          void this.file.clear();
          return true;
        }),
      },
      {
        type: "separator",
      },
      {
        text: "Open...",
        shortcut: [new KeyGesture(["Command"], "KeyO")],
        run: action(() => {
          void this.file.open();
          return true;
        }),
      },
      {
        type: "separator",
      },
      {
        text: "Save",
        shortcut: [new KeyGesture(["Command"], "KeyS")],
        run: action(() => {
          void this.file.save();
          return true;
        }),
      },
      {
        text: "Save As...",
        shortcut: [new KeyGesture(["Shift", "Command"], "KeyS")],
        run: action(() => {
          void this.file.saveAs();
          return true;
        }),
      },
    ];
  }

  getMainMenu(): MenuItem[] {
    return [
      {
        text: "File",
        children: this.getFileMenu(),
      },

      {
        text: "Edit",
        children: this.getEditMenu(),
      },
    ];
  }
}
