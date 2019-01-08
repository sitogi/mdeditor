import { app, Menu, BrowserWindow } from "electron";

function setAppMenu(options) {
    // テンプレートの定義
    const template = [
        {
            label: "File",
            submenu: [
                { label: "Open", accelerator: "CmdOrCtrl+O", click: () => options.openFile() },
                { label: "Save", accelerator: "CmdOrCtrl+S", click: () => options.saveFile() },
                { label: "Save As...", click: () => options.saveAsNewFile() },
                { label: "Export PDF", click: () => options.exportPDF() }
            ]
        },
        {
            label: "Edit",
            submenu: [
                { label: "Copy", accelerator: "CmdOrCtrl+P", role: "copy" },
                { label: "Paste", accelerator: "CmdOrCtrl+V", role: "paste" },
                { label: "Cut", accelerator: "CmdOrCtrl+C", role: "cut" },
                { label: "Select", accelerator: "CmdOrCtrl+A", role: "selectall" }
            ]
        },
        {
            label: "View",
            submenu: [
                {
                    label: "Toggle DevTools",
                    accelerator: process.platform === "darwin" ? "Alt+Command+I" : "Ctrl+Shift+I",
                    click: (item, focusedWindow) => focusedWindow && focusedWindow.toggleDevTools()
                }
            ]
        },
        {
            label: "MarkdownEditor",
            submenu: [
                { label: "Quit", accelerator: "CmdOrCtrl+Q", click: () => app.quit() }
            ]
        }
    ];

    const appMenu = Menu.buildFromTemplate(template);

    Menu.setApplicationMenu(appMenu);
}

export default setAppMenu;

