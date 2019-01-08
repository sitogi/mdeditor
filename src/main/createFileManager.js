import fs from "fs";

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

}

// クラス名 = ファイル名という縛りがないのと、
// クラスが static なメソッドを持てないから、
// こんな感じで外出しのファクトリメソッドをファイル名にしているのだろうか
function createFileManager() {
    return new FileManager();
}

export default createFileManager;

