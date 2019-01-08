import React from "react";
import { render } from "react-dom";
import MarkdownEditorUI from "./components/MarkdownEditorUI";

// render() は第一引数の内容を第二引数のところに描画するって意味かも
render(<MarkdownEditorUI />, document.getElementById("app"));

