import React from "react";

import style from "./Editor.css";

// このクラスは state を持たない。
// 入力されたテキストを親コンポーネントで管理するために、値とその onChange はプロパティ経由で親から渡す。
export default function Editor(props) {
    return (
        <textarea
            id="editor"
            className={`${style.editor} ${props.className}`}
            value={props.value}
            onChange={props.onChange}
        />
    );
}

