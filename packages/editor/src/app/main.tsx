/// <reference types="vite/client" />

import React from "react";
import ReactDOM from "react-dom/client";
import { App } from "./App";
import { FileList } from "./FileList";

const fileList = new FileList();

window.addEventListener("beforeunload", (e) => {
  e.preventDefault();

  if (fileList.hasUnsavedChanges) {
    return (e.returnValue =
      "You have unsaved changes. Are you sure you want to leave?");
  }
});

const rootElem = document.createElement("div");
document.body.append(rootElem);

let root = ReactDOM.createRoot(rootElem);
root.render(
  <React.StrictMode>
    <App fileList={fileList} />
  </React.StrictMode>
);

if (import.meta.hot) {
  import.meta.hot.accept("./App", async () => {
    root.unmount();
    root = ReactDOM.createRoot(rootElem);

    const NextApp = (await import("./App")).App;
    root.render(
      <React.StrictMode>
        <NextApp fileList={fileList} />
      </React.StrictMode>
    );
  });
}
