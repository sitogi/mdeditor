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
    /* metaFile の構成
    {
        "storages": [
            {
              "name": "takanote",
              "path": "/home/masayuki/takanote"
            },
            {
              "name": "takanote2",
              "path": "/home/masayuki/takanote2"
            },
            {
              "name": "takanote3",
              "path": "/home/masayuki/takanote3"
            },
            {
              "name": "takanote4",
              "path": "/home/masayuki/takanote4"
            }
        ]
    }
    */

function updateMetaInfo(metaInfo) {
    const metaFilePath = fileManager.join(fileManager.getHomeDir(), ".takanote");
    // TODO ここから頑張る
    fileManager.saveFileSync(metaFilePath, JSON.stringify(metaInfo, null, "  "));

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

ipcMain.on("CREATE_STORAGE", (event, storage) => {
    if (fileManager.exist(storage.path)) {
        return;
    }
    fileManager.createDirectory(storage.path);
    fileManager.createDirectory(fileManager.join(storage.path, "default"));

    const metaInfo = loadMetaInfo(); 
    metaInfo.storages.push({name: storage.name, path: storage.path});

    updateMetaInfo(metaInfo);
});

ipcMain.on("GET_STORAGES", (event, arg) => {
    const metaInfo = loadMetaInfo();
    const storages = fileManager.createStorageStructures(metaInfo.storages);
    event.returnValue = storages;
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
        .catch((error) => event.sender.send("NOTE_TEXT", error.toString()));
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

