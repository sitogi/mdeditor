import fs from "fs";
import path from "path";

class FileManager {

    constructor() {
        this.openedFilePath = "";
    }

    saveFile(filePath, text) {
        return new Promise((resolve) => {
            fs.writeFileSync(filePath, text);
            resolve(); // コールバックのための処理
        });
    }

    openFile(filePath) {
        return new Promise((resolve) => {
            const content = fs.readFileSync(filePath, "utf8");
            resolve(content);
            this.openedFilePath = filePath;
        });
    }

    overWriteFile(text) {
        return this.saveFile(this.openedFilePath, text);
    }

    exist(filePath) {
        return fs.existsSync(filePath);
    }

    load(filePath) {
        return fs.readFileSync(filePath, "utf8");
    }

    create(filePath) {
        fs.writeFileSync(filePath, "");
    }

    getHomeDir() {
        return process.env[process.platform == "win32" ? "USERPROFILE" : "HOME"];
    }

    join(dirPath, fileName) {
        return path.join(dirPath, fileName);
    }
    
    createStorageStructure(storage) {
        const folderPaths = fs.readdirSync(storage.path);
        const folders = [];
        folderPaths.map(folderPath => {
            const absFolderPath = path.join(storage.path, folderPath);
            if (fs.statSync(absFolderPath).isFile()) {
                return;
            }
            
            const notePaths = fs.readdirSync(absFolderPath);
            folders.push({ name: folderPath, path: absFolderPath, notes: notePaths });
        });
        const structure = { name: storage.name, path: storage.path, folders: folders };
        return structure;
    }

    createStorageStructures(storages) {
        let structures = [];
        storages.map(storage => {
            structures.push(this.createStorageStructure(storage));
        });
        return structures;
    }

}

function createFileManager() {
    return new FileManager();
}

export default createFileManager;

