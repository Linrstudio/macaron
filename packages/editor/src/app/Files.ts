import { computed, makeObservable, observable } from "mobx";
import { File } from "./File";

export class Files {
  constructor() {
    makeObservable(this);
  }

  readonly files = observable.array<File>();
  @observable currentFileIndex = 0;

  @computed get currentFile(): File | undefined {
    return this.files[this.currentFileIndex];
  }
}
