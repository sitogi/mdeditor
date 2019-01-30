import { app, ipcMain } from "electron";
import createMainWindow from "./createMainWindow";
import createPDFWindow from "./createPDFWindow";
import setAppMenu from "./setAppMenu";
import createFileManager from "./createFileManager";
import showSaveAsNewFileDialog from "./showSaveAsNewFileDialog";
import showOpenFileDialog from "./showOpenFileDialog";
import showExportPDFDialog from "./showExportPDFDialog";

let mainWindow = null;
let fileMgr = null;

function openFile() {
    showOpenFileDialog()
        .then((filePath) => fileMgr.openFile(filePath))
        .then((content) => mainWindow.sendText(content))
        .catch((error) => console.log(error));
}

function saveFile() {
    if (fileMgr.openedFilePath) {
        mainWindow.requestText()
            .then((text) => fileMgr.overWriteFile(text))
            .catch((error) => console.log(error));
    } else {
        saveAsNewFile();
    }
}

function saveAsNewFile() {
    Promise.all([ showSaveAsNewFileDialog(), mainWindow.requestText() ])
        .then(([filePath, text]) => fileMgr.saveFile(filePath, text))
        .catch((error) => console.log(error));
}

function loadMetaInfo() {
    const metaFilePath = fileMgr.join(fileMgr.getHomeDir(), ".takanote");
    if (!fileMgr.exist(metaFilePath)) {
        fileMgr.create(metaFilePath);
    }
    return JSON.parse(fileMgr.load(metaFilePath));
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
    const metaFilePath = fileMgr.join(fileMgr.getHomeDir(), ".takanote");
    fileMgr.saveFileSync(metaFilePath, JSON.stringify(metaInfo, null, "  "));
}

function exportPDF() {
    Promise.all([ showExportPDFDialog(), mainWindow.requestText() ])
        .then(([ filePath, text ]) => {
            const pdfWindow = createPDFWindow(text);
            pdfWindow.on("RENDERING_COMPLETE", () => {
                pdfWindow.generatePDF()
                    .then((data) => fileMgr.saveFile(filePath, data))
                    .then(() => pdfWindow.close())
                    .catch((error) => {
                        console.log(error);
                        pdfWindow.close();
                    });
            });
        });
}

ipcMain.on("CREATE_STORAGE", (event, storage) => {
    if (fileMgr.exist(storage.path)) {
        return;
    }
    fileMgr.createDirectory(storage.path);
    fileMgr.createDirectory(fileMgr.join(storage.path, "default"));

    const metaInfo = loadMetaInfo();
    metaInfo.storages.push({name: storage.name, path: storage.path});

    updateMetaInfo(metaInfo);
});

ipcMain.on("GET_STORAGES", (event, arg) => {
    const metaInfo = loadMetaInfo();
    const storages = fileMgr.createStorageStructures(metaInfo.storages);
    event.returnValue = storages;
});

ipcMain.on("GET_FOLDERS", (event, arg) => {
    // TODO
});

ipcMain.on("CREATE_FOLDER", (event, newFolder) => {
    const newFolderPath = fileMgr.join(newFolder.parentPath, newFolder.name);
    fileMgr.createDirectory(newFolderPath);
});

ipcMain.on("OPEN_NOTE", (event, filePath) => {
    fileMgr.openFile(filePath)
        .then((content) => event.sender.send("NOTE_TEXT", content))
        .catch((error) => event.sender.send("NOTE_TEXT", error.toString()));
});

ipcMain.on("CREATE_NOTE", (event, folderPath) => {
    const noteDirPath = fileMgr.join(folderPath, Date.now().toString()); // TODO to UUID
    fileMgr.createDirectory(noteDirPath);

    const contentFilePath = fileMgr.join(noteDirPath, "content.md");
    fileMgr.create(contentFilePath);

    const noteInfoPath = fileMgr.join(noteDirPath, "noteinfo.json");
    const noteInfo = { path: contentFilePath, title: "Empty Note" };
    fileMgr.saveFileSync(noteInfoPath, JSON.stringify(noteInfo, null, "  "));

    event.sender.send("NOTE_INFO", noteInfo.path);
});

ipcMain.on("WRITE_NOTE", (event, note) => {
    // ノート
    fileMgr.saveFile(note.path, note.content);

    // タイトル
    const noteInfoPath = note.path.replace("content.md", "noteinfo.json");
    const noteInfo = JSON.parse(fileMgr.load(noteInfoPath));
    noteInfo.title = createTitle(note.content);
    fileMgr.saveFileSync(noteInfoPath, JSON.stringify(noteInfo, null, "  "));
});

ipcMain.on("DELETE_STORAGE", (event, path) => {
    fileMgr.deleteDirRecursive(path);

    const metaInfo = loadMetaInfo();

    // 削除
    metaInfo.storages = metaInfo.storages.filter(s => s.path !== path);
    updateMetaInfo(metaInfo);

    event.returnValue = true;
});

ipcMain.on("DELETE_FOLDER", (event, path) => {
    fileMgr.deleteDirRecursive(path);
    event.returnValue = true;
});

ipcMain.on("DELETE_NOTE", (event, path) => {
    fileMgr.deleteDirRecursive(path);
    event.returnValue = true;
});

function createTitle(str) {
    if (!str || str === "") {
        return "Empty Note";
    }

    const firstLineSep = str.indexOf("\n");
    if (firstLineSep === -1) {
        return removeMetaChars(str).trim();
    }

    const firstLine = str.substring(0, firstLineSep);
    return removeMetaChars(firstLine).trim();
}

function removeMetaChars(str) {
    return str.replace(/#/g, "");
}

app.on("ready", () => {
    mainWindow = createMainWindow();
    fileMgr = createFileManager();
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

