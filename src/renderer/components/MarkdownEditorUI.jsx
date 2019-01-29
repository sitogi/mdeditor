import React from "react";
import { ipcRenderer } from "electron";

import StorageList from "./StorageList";
import NoteList from "./NoteList";
import Editor from "./Editor";
import Previewer from "./Previewer";
import style from "./MarkdownEditorUI.css";

const EDITOR_AND_PREVIERWER_STYLE = {
    "display": "flex",
    "flex-direction": "row",
    "width": "80%"
};

function getStorageList() {
    const storages = ipcRenderer.sendSync("GET_STORAGES");
    return storages;
}

export default class MarkDownEditorUI extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            text: "",
            showPreviewer: true,
            storages: [],
            currentStoragePath: "",
            currentFolderPath: "",
            currentNotePath: "",
        };
        this.onChangeText = this.onChangeText.bind(this);
        this.onKeyDown = this.onKeyDown.bind(this);
        this.onClickStorage = this.onClickStorage.bind(this);
        this.onClickFolder = this.onClickFolder.bind(this);
        this.onClickNote = this.onClickNote.bind(this);
        this.onClickCreateNote = this.onClickCreateNote.bind(this);
        this.refreshStorages = this.refreshStorages.bind(this);
        this.createStorage = this.createStorage.bind(this);
        this.createFolder = this.createFolder.bind(this);
    }

    onChangeText(e) {
        const note = { path: this.state.currentNotePath, content: e.target.value};
        ipcRenderer.send("WRITE_NOTE", note);
        // TODO いちいちストレージ一覧更新するのは重すぎるので構成を変えるべき
        const storages = getStorageList();
        this.setState({ storages: storages, text: e.target.value });
    }

    onKeyDown(e) {
        if (e.ctrlKey && e.keyCode === 66) {
            this.setState({
                text: this.state.text,
                showPreviewer: !this.state.showPreviewer
            });
        }
    }

    onClickStorage(e, storage) {
        this.setState(
            {
                currentStoragePath: storage.path,
                currentFolderPath: ""
            }
        );
    };

    onClickFolder(e, folder) {
        this.setState({ currentFolderPath: folder.path });
    };

    onClickNote(e, note) {
        ipcRenderer.send("OPEN_NOTE", note.path);
        ipcRenderer.once("NOTE_TEXT", (event, content) => {
            this.setState({
                text: content
            });
        });
        this.setState({ currentNotePath: note.path });
    };

    onClickCreateNote(e) {
        ipcRenderer.send("CREATE_NOTE", this.state.currentFolderPath);
        ipcRenderer.once("NOTE_INFO", (event, notePath) => {
            const storages = getStorageList();
            this.setState({
                text: "",
                storages: storages,
                currentNotePath: notePath,
            });
        });
    }

    refreshStorages() {
        const storages = getStorageList();
        this.setState({ storages: storages });
    }

    createStorage(storage) {
        ipcRenderer.send("CREATE_STORAGE", storage);
        const storages = getStorageList();
        const init = storages.find(s => s.path === storage.path);
        this.setState({
            currentStoragePath: storage.path,
            currentFolderPath: init.folders[0].path,
            currentNotePath: "",
            text: "",
            storages: storages,
        });
    }

    createFolder(folderName) {
        const newFolder = { name: folderName, parentPath: this.state.currentStoragePath };
        ipcRenderer.send("CREATE_FOLDER", newFolder);
        const newFolderPath = newFolder.parentPath + "/" + newFolder.name;

        const update = (state, props) => {
            const storages = getStorageList();
            return { storages: storages };
        };
        const callback = () => {
            this.setState({
                currentNotePath: "",
                text: "",
                currentFolderPath: newFolderPath,
        })};
        // storages の更新が完了後に currentFolderPath を更新しないと反映が遅れる
        this.setState(update, callback);
    }

    componentDidMount() {
        const storages = getStorageList();
        this.setState({ storages: storages });

        ipcRenderer.on("REQUEST_TEXT", () => {
            ipcRenderer.send("REPLY_TEXT", this.state.text);
        });

        ipcRenderer.on("OPEN_FILE", (_e, text) => {
            this.setState({ text: text });
        });
    }

    componentWillUnmount() {
        ipcRenderer.removeAllListeners();
    }

    renderEditor() {
        return (
           <Editor
               className={style.editorArea}
               value={this.state.text}
               onChange={this.onChangeText}
           />
        );
    }

    renderPreviewer() {
        return (
            <Previewer
                className={style.previewerArea}
                value={this.state.text}
            />
        );
    }

    render() {
        return (
            <div className={style.markdownEditor}
                tabIndex="0"
                onKeyDown={this.onKeyDown}
            >
                <StorageList
                    storages={this.state.storages}
                    currentStoragePath={this.state.currentStoragePath}
                    currentFolderPath={this.state.currentFolderPath}
                    onClickStorage={this.onClickStorage}
                    onClickFolder={this.onClickFolder}
                    createStorage={this.createStorage}
                    createFolder={this.createFolder}
                    refreshStorages={this.refreshStorages}
                />
                <NoteList
                    noteList={this.getCurrentNoteInfoList()}
                    currentNotePath={this.state.currentNotePath}
                    onClickNote={this.onClickNote}
                    onClickCreateNote={this.onClickCreateNote}
                />
                <div id="editorAndPreviewer" style={EDITOR_AND_PREVIERWER_STYLE}>
                    { this.renderEditor() }
                    { this.state.showPreviewer ? this.renderPreviewer() : <div /> }
                </div>
            </div>
        );
    }

    getCurrentNoteInfoList() {
        const targetStorage = this.state.currentStoragePath;
        const targetFolder = this.state.currentFolderPath;

        if (!targetStorage || !targetFolder) {
            return [];
        }

        const storage = this.state.storages.find(s => s.path === targetStorage);
        if (!storage) {
            return [];
        }
        const folder = storage.folders.find(f => f.path === targetFolder);
        if (!folder) {
            return [];
        }
        const notes = folder.notes;
        return notes;
    }

}

