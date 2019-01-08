import React from "react";
import { ipcRenderer } from "electron";
import Editor from "./Editor";
import Previewer from "./Previewer";

import style from "./MarkdownEditorUI.css";

export default class MarkDownEditorUI extends React.Component {

    constructor(props) {
        super(props);
        this.state = { text: "" };
        this.onChangeText = this.onChangeText.bind(this);
    }

    onChangeText(e) {
        this.setState({ text: e.target.value });
    }

    // Component が View にマウントされる際に呼び出される
    componentDidMount() {
        ipcRenderer.on("REQUEST_TEXT", () => {
            ipcRenderer.send("REPLY_TEXT", this.state.text);
        });

        ipcRenderer.on("OPEN_FILE", (_e, text) => {
            this.setState({ text });
        });
    }

    // Component が View からアンマウントされる際に呼び出される
    componentWillUnmount() {
        ipcRenderer.removeAllListeners();
    }

    render() {
        return (
            <div className={style.markdownEditor}>
                <Editor
                    className={style.editorArea}
                    value={this.state.text}
                    onChange={this.onChangeText}
                />
                <Previewer
                    className={style.previewerArea}
                    value={this.state.text}
                />
            </div>
        );
    }
}

