import React from "react";
import { ipcRenderer } from "electron";

import StorageList from "./StorageList";
import Editor from "./Editor";
import Previewer from "./Previewer";
import style from "./MarkdownEditorUI.css";

export default class MarkDownEditorUI extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            text: "",
            showPreviewer: true,
            storages: [],
            currentStoragePath: "",
            currentFolderPath: ""
        };
        this.onChangeText = this.onChangeText.bind(this);
        this.onKeyDown = this.onKeyDown.bind(this);
        this.onClickStorage = this.onClickStorage.bind(this);
        this.onClickFolder = this.onClickFolder.bind(this);
    }

    onChangeText(e) {
        this.setState({ text: e.target.value });
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

    getStorageList() {
        ipcRenderer.send("GET_STORAGES");
        ipcRenderer.on("SEND_STORAGES", (event, storages) => {
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
                />
                { this.renderEditor() }
                { this.state.showPreviewer ? this.renderPreviewer() : <div /> }
            </div>
        );
    }
 
}

