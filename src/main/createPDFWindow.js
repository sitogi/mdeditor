import { BrowserWindow, ipcMain } from "electron";
import EventEmitter from "events";

class PDFWindow extends EventEmitter {

    constructor(text) {
        super(text);
        this.window = new BrowserWindow({ show: false });
        this.window.loadURL(`file://${__dirname}/../../pdf.html`);
        ipcMain.once("REQUEST_TEXT", (e) => {
            e.returnValue = text;
        });
        ipcMain.once("RENDERING_COMPLETE", () => {
            this.emit("RENDERING_COMPLETE");
        });
    }

    generatePDF() {
        return new Promise((resolve, reject) => {
            this.window.webContents.printToPDF({}, (error, data) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(data);
                }
            });
        });
    }

    close() {
        this.window.close();
        this.window.on("closed", () => {
            this.window = null;
        });
    }

}

function createPDFWindow(text) {
    return new PDFWindow(text);
}

export default createPDFWindow;

