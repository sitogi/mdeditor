import React from "react";

const STYLE_NOTELIST = {
    width: "15%"
};

export default class NoteList extends React.Component {
    
    constructor(props) {
        super(props);
    }
    
    render() {
        return (
            <div style={STYLE_NOTELIST}>
                <div>
                    <strong>Notes</strong>
                </div>
                {this.props.noteList.map(note => {
                    return (
                        <div className="list-group-item" onClick={e => this.props.onClickNote(e, note)}>
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

