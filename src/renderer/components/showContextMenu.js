import { remote, ipcRenderer } from "electron";

const { Menu, MenuItem } = remote;

/* items はラベルとアクション、アクションに渡す引数からなる */
function showContextMenu(e, items) {
    e.preventDefault();
    const menu = new Menu();
    items.forEach(item => {
        const menuItem = new MenuItem({ label: item.label, click: item.action });
        menu.append(menuItem);
    });
    menu.popup();
}

export default showContextMenu;

