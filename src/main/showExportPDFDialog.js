import { dialog } from "electron";

function showExportPDFDialog() {
    return new Promise((resolve, reject) => {
        const filePath = dialog.showSaveDialog(
            {
                title: "export pdf",
                ffilters: [ {name: "pdf file", extensions: [ "pdf" ] } ]
            }
        );

        if (filePath) {
            resolve(filePath);
        } else {
            reject();
        }
    });
}

export default showExportPDFDialog;

