import { app } from "electron";
import createMainWindow from "./createMainWindow";
import createPDFWindow from "./createPDFWindow";
import setAppMenu from "./setAppMenu";
import createFileManager from "./createFileManager";
import showSaveAsNewFileDialog from "./showSaveAsNewFileDialog";
import showOpenFileDialog from "./showOpenFileDialog";
import showExportPDFDialog from "./showExportPDFDialog";

let mainWindow = null;
let fileManager = null;

function openFile() {
    showOpenFileDialog()
        .then((filePath) => fileManager.openFile(filePath))
        .then((content) => mainWindow.sendText(content))
        .catch((error) => console.log(error));
}

function saveFile() {
    if (fileManager.openedFilePath) {
        mainWindow.requestText()
            .then((text) => fileManager.overWriteFile(text))
            .catch((error) => console.log(error));
    } else {
        saveAsNewFile();
    }
}

function saveAsNewFile() {
    Promise.all([ showSaveAsNewFileDialog(), mainWindow.requestText() ])
        .then(([filePath, text]) => fileManager.saveFile(filePath, text))
        .catch((error) => console.log(error));
}

function exportPDF() {
    Promise.all([ showExportPDFDialog(), mainWindow.requestText() ])
        .then(([ filePath, text ]) => {
            const pdfWindow = createPDFWindow(text);
            pdfWindow.on("RENDERING_COMPLETE", () => {
                pdfWindow.generatePDF()
                    .then((data) => fileManager.saveFile(filePath, data))
                    .then(() => pdfWindow.close())
                    .catch((error) => {
                        console.log(error);
                        pdfWindow.close();
                    });
            });
        });
}

app.on("ready", () => {
    mainWindow = createMainWindow();
    fileManager = createFileManager();
    setAppMenu({ openFile, saveFile, saveAsNewFile, exportPDF });
});

app.on("window-all-closed", () => {
    if (process.platform !== "darwin") {
        app.quit();
    }
});

app.on("activate", () => {
    if (!hasVisibleWindows) {
        mainWindow = createMainWindow();
    }
});

