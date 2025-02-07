import http from "http";
import path from "path";
import { AddressInfo } from "net";
import handler from "serve-handler";
import * as vscode from "vscode";

// https://vitejs.dev/config/#server-fs-deny
const excludedFiles = [".env", ".env.*", "*.{pem,crt}"];

export class FileServer {
  constructor(rootUri: vscode.Uri) {
    this.publicPathUri = rootUri;
    this._server = http.createServer((request, response) => {
      return handler(request, response, {
        public: rootUri.fsPath,
        directoryListing: false,
        rewrites: excludedFiles.map((excludedFile) => {
          return {
            source: `**/${excludedFile}`,
            destination: "",
          };
        }),
        headers: [
          {
            source: "**",
            headers: [
              {
                key: "Access-Control-Allow-Origin",
                value: "*",
              },
            ],
          },
        ],
      });
    });
  }

  readonly publicPathUri: vscode.Uri;
  private _server: http.Server;
  private _port = 0;

  get port(): number {
    return this._port;
  }

  get origin(): string {
    return `http://localhost:${this.port}`;
  }

  listen(): Promise<void> {
    return new Promise((resolve, reject) => {
      this._server.listen(0, () => {
        this._port = (this._server.address() as AddressInfo).port;
        resolve();
      });
    });
  }

  close(): Promise<void> {
    return new Promise((resolve, reject) => {
      this._server.close((err) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }

  toServerUri(uri: vscode.Uri): vscode.Uri {
    const relativePath = path.posix.relative(this.publicPathUri.path, uri.path);
    if (relativePath.startsWith("..")) {
      throw new Error("Invalid path");
    }
    if (relativePath === ".") {
      return vscode.Uri.parse(`http://localhost:${this.port}`);
    }
    return vscode.Uri.parse(`http://localhost:${this.port}/${relativePath}`);
  }
}
