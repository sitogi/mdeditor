import { app, ipcMain } from "electron";
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

function loadMetaInfo() {
    const metaFilePath = fileManager.join(fileManager.getHomeDir(), ".takanote");
    if (!fileManager.exist(metaFilePath)) {
        fileManager.create(metaFilePath);
    }
    return JSON.parse(fileManager.load(metaFilePath)); 
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

ipcMain.on("NEW_STORAGE", (event, arg) => {
    // TODO    
    console.log("NEW_STORAGE was received");
});

ipcMain.on("GET_STORAGES", (event, arg) => {
    const metaInfo = loadMetaInfo();
    const storages = fileManager.createStorageStructures(metaInfo.storages);
    event.sender.send("SEND_STORAGES", storages);
});

ipcMain.on("GET_FOLDERS", (event, arg) => {
    // TODO
    console.log("GET_FOLDERS was called");
});

ipcMain.on("NEW_FOLDER", (event, arg) => {
    // TODO
    console.log("NEW_FOLDER");
});

ipcMain.on("OPEN_NOTE", (event, filePath) => {
    fileManager.openFile(filePath)
        .then((content) => event.sender.send("NOTE_TEXT", content))
        .catch((error) => console.log(error));
});

ipcMain.on("WRITE_NOTE", (event, note) => {
    fileManager.saveFile(note.path, note.content);
});

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

