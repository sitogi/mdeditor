import React from "react";
import { ipcRenderer } from "electron";

import StorageList from "./StorageList";
import NoteList from "./NoteList";
import Editor from "./Editor";
import Previewer from "./Previewer";
import style from "./MarkdownEditorUI.css";

const STORAGE_LIST_STYLE = {
    width: "10%",                                                     
    padding: "1px",
};

const STYLE_NOTE_LIST = {
    width: "10%",
    padding: "1px",
    "border-right": "solid #ddd 1px",
    "border-left": "solid 1px",
};

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

    getStorageList() {
        ipcRenderer.send("GET_STORAGES");
        ipcRenderer.once("SEND_STORAGES", (event, storages) => {
            this.setState({ storages: storages });
        });
    }

    componentDidMount() {
        this.getStorageList();

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
            <div className="window">
                <div className="window-content">
                    <div className="pane-group"
                         tabIndex="0"
                         onKeyDown={this.onKeyDown}
                    >
                        <div className="pane-sm sidebar">
                            <StorageList
                                style={STORAGE_LIST_STYLE}
                                storages={this.state.storages}
                                currentStoragePath={this.state.currentStoragePath}
                                currentFolderPath={this.state.currentFolderPath}
                                onClickStorage={this.onClickStorage}
                                onClickFolder={this.onClickFolder}
                            />
                        </div>
                        <div className="pane-sm sidebar">
                            <NoteList
                                style={STYLE_NOTE_LIST}
                                noteList={this.getCurrentNoteList()}
                                currentNote={this.state.currentNote}
                                onClickNote={this.onClickNote}
                            />
                        </div>
                        <div className="pane" style={EDITOR_AND_PREVIERWER_STYLE}>
                            { this.renderEditor() }
                            { this.state.showPreviewer ? this.renderPreviewer() : <div /> }
                        </div>
                    </div>
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

