import { computed, makeObservable, observable } from "mobx";
import { File } from "./File";

export class FileList {
  constructor() {
    makeObservable(this);
  }

  readonly files = observable.array<File>();
  @observable currentFileIndex = 0;

  @computed get currentFile(): File | undefined {
    if (this.currentFileIndex < this.files.length) {
      return this.files[this.currentFileIndex];
    }
  }

  newFile(): File {
    console.log("new file");
    const file = new File();
    this.files.push(file);
    return file;
  }

  async openFile(): Promise<File> {
    const file = new File();
    await file.open();
    this.files.push(file);
    return file;
  }

  get hasUnsavedChanges(): boolean {
    for (const file of this.files) {
      if (file.history.isModified) {
        return true;
      }
    }

    return false;
  }
}
