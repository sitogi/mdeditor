import { BrowserWindow, ipcMain, shell } from "electron";

class MainWindow {
    constructor() {
        this.window = new BrowserWindow({ width: 1400, height: 800 });
        this.window.loadURL(`file://${__dirname}/../../index.html`);
        this.window.on("closed", () => {
            this.window = null;
        });
        this.window.webContents.on("will-navigate", (e, url) => {
            e.preventDefault();
            shell.openExternal(url);
        });
    }

    requestText() {
        return new Promise((resolve) => {
            this.window.webContents.send("REQUEST_TEXT");
            ipcMain.once("REPLY_TEXT", (_e, text) => resolve(text));
        });
    }

    sendText(text) {
        this.window.webContents.send("OPEN_FILE", text);
    }
        
}

function createMainWindow() {
    return new MainWindow();
}

export default createMainWindow;

