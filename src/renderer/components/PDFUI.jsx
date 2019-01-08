import React from "react";
import { ipcRenderer } from "electron";
import Previewer from "./Previewer";

export default class PDFUI extends React.Component {

    constructor(props) {
        super(props);
        this.state = { text: "" };
    }

    componentDidMount() {
        const text = ipcRenderer.sendSync("REQUEST_TEXT");
        this.setState({ text });
    }

    componentDidUpdate() {
        this.syncImageRendered().then(() => {
            ipcRenderer.send("RENDERING_COMPLETE");
        });
    }
    
    syncImageRendered() {
        // img 要素がある場合には読み込み完了まで待つ
        const images = Array.prototype.slice.call(document.querySelectorAll("img"));
        const loadingImages = images.filter((image) => !image.complete);
        
        if (loadingImages.length === 0) {
            return Promise.resolve();
        }

        return Promise.all(loadingImages.map((image) => {
            new Promise((resolve) => image.onload = () => resolve()));
        });
    }

    render() {
        return (
            <div>
                <Previewer value={this.state.text} />
            </div>
        );
    }

}

