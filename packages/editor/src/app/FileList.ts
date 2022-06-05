import { computed, makeObservable, observable } from "mobx";
import { File } from "./File";

export class FileList {
  constructor() {
    makeObservable(this);
  }

  readonly files = observable.array<File>();
  @observable currentFileIndex = 0;

  @computed get currentFile(): File | undefined {
    return this.files[this.currentFileIndex];
  }

  newFile(): File {
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
}
