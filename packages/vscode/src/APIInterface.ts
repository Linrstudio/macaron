export interface IWebviewAPI {
  setContent(content: string, url: string | undefined): void;
  getContent(): string;
  updateSavePoint(): void;
  setImageAssets(assets: string[]): void;
}

export interface IExtensionAPI {
  onDirtyChange(isDirty: boolean): void;
}
