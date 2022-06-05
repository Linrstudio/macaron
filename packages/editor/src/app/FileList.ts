import { makeObservable, observable } from "mobx";
import { File } from "./File";

export class FileList {
  constructor() {
    makeObservable(this);
  }

  private readonly _files = observable.array<File>();
  @observable _currentFile: File | undefined = undefined;

  get files(): readonly File[] {
    return this._files;
  }

  get currentFile(): File | undefined {
    return this._currentFile;
  }

  newFile(): File {
    console.log("new file");
    const file = new File();
    this._files.push(file);
    this._currentFile = file;
    return file;
  }

  async openFile(): Promise<File> {
    const file = new File();
    await file.open();
    this._files.push(file);
    this._currentFile = file;
    return file;
  }

  get hasUnsavedChanges(): boolean {
    for (const file of this._files) {
      if (file.history.isModified) {
        return true;
      }
    }

    return false;
  }
}
