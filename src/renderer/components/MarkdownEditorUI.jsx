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
            currentNote: "",
        };
        this.onChangeText = this.onChangeText.bind(this);
        this.onKeyDown = this.onKeyDown.bind(this);
        this.onClickStorage = this.onClickStorage.bind(this);
        this.onClickFolder = this.onClickFolder.bind(this);
        this.onClickNote = this.onClickNote.bind(this);
        this.refreshStorageList = this.refreshStorageList.bind(this);
        this.createStorage = this.createStorage.bind(this);
    }

    onChangeText(e) {
        this.setState({ text: e.target.value });
        const note = { path: this.state.currentNotePath, content: e.target.value};
        ipcRenderer.send("WRITE_NOTE", note);
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
        ipcRenderer.send("OPEN_NOTE", this.state.currentFolderPath + "/" + note + "/content.md");
        ipcRenderer.once("NOTE_TEXT", (event, content) => {
            this.setState({
                text: content
            });
        });
        // TODO ノートのパスも最初から保持しておくべき
        this.setState({ 
            currentNote: note,
            currentNotePath: this.state.currentFolderPath + "/" + note + "/content.md" });
    };

    refreshStorageList() {
        const storages = ipcRenderer.sendSync("GET_STORAGES");
        return storages;
    }

    createStorage(storage) {
        ipcRenderer.send("CREATE_STORAGE", storage);
        const storages = this.refreshStorageList();
        const init = storages.find(s => s.path === storage.path);
        this.setState({
            currentStoragePath: storage.path,
            currentFolderPath: init.folders[0].path,
            currentNote: "",
            currentNotePath: "",
            text: "",
            storages: storages,
        });
    }

    componentDidMount() {
        const storages = this.refreshStorageList();
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
                />
                <NoteList
                    noteList={this.getCurrentNoteList()}
                    currentNote={this.state.currentNote}
                    onClickNote={this.onClickNote}
                />
                <div id="editorAndPreviewer" style={EDITOR_AND_PREVIERWER_STYLE}>
                    { this.renderEditor() }
                    { this.state.showPreviewer ? this.renderPreviewer() : <div /> }
                </div>
            </div>
        );
    }
 
    getCurrentNoteList() {
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
        const noteList = folder.notes;
        return noteList;
    }

}

