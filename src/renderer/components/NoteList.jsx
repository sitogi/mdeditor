import React from "react";

const STYLE_HEADER = {
    "border-bottom": "solid #ddd 1px",
    "font-size": "16px",
};

const STYLE_ICON = {
};

export default class NoteList extends React.Component {
    
    constructor(props) {
        super(props);
    }
    
    render() {
        return (
            <div className="list-group">
                <div className="list-group-header" style={STYLE_HEADER}>
                    <strong>Notes</strong>
                    <span className="icon icon-plus-squared pull-right" />
                </div>
                {this.props.noteList.map(note => {
                    const isSelected = note === this.props.currentNote;
                    return (
                        <div
                            className={isSelected ? "list-group-item selected" : "list-group-item"}
                            onClick={e => this.props.onClickNote(e, note)}
                        >
                            <span className="media-object icon icon-doc-text pull-left" />
                            <div id="noteName" className="media-body">
                                <div>{note}</div> 
                            </div>
                        </div>
                    );
                })}
            </div>
        );
    }

}

