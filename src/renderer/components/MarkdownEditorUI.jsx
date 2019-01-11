import React from "react";
import { ipcRenderer } from "electron";

import StorageList from "./StorageList";
import NoteList from "./NoteList";
import Editor from "./Editor";
import Previewer from "./Previewer";
import style from "./MarkdownEditorUI.css";

export default class MarkDownEditorUI extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            text: "",
            showPreviewer: true
        };
        this.onChangeText = this.onChangeText.bind(this);
        this.onKeyDown = this.onKeyDown.bind(this);
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

    // Component が View にマウントされる際に呼び出される
    componentDidMount() {
        ipcRenderer.on("REQUEST_TEXT", () => {
            ipcRenderer.send("REPLY_TEXT", this.state.text);
        });

        ipcRenderer.on("OPEN_FILE", (_e, text) => {
            this.setState({ text: text });
        });
    }

    // Component が View からアンマウントされる際に呼び出される
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
                <StorageList />
                <NoteList />
                { this.renderEditor() }
                { this.state.showPreviewer ? this.renderPreviewer() : <div /> }
            </div>
        );
    }
 
}

