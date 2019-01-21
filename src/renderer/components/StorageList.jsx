import React from "react";
import { ipcRenderer } from "electron";

const STORAGE_LIST_STYLE = {
    width: "15%"
};

const FORM_STYLE = {
    display: "flex"
};

const BUTTON_STYLE = {
    margin: 10
};

const FOLDER_STYLE = {
    "text-indent": "1em"
};

export default class StorageList extends React.Component {

    constructor(props) {
        super(props);
        this.handleOnSubmit = this.handleOnSubmit.bind(this);
    }

    handleOnSubmit(e) {
        // TODO
        ipcRenderer.send("NEW_STORAGE");
    }

    render() {
        return (
            <div className="list-storage" style={STORAGE_LIST_STYLE}>
                <div className="list-storage-header">
                    <form style={FORM_STYLE} onSubmit={this.handleOnSubmit}>
                        <strong>Storage </strong>
                        <button className="btn btn-default" style={BUTTON_STYLE}>
                            <span className="icon icon-plus" />
                        </button>
                    </form>
                </div>
                {this.props.storages.map(s => {
                   const isSelected = s.path === this.props.currentStoragePath;
                   if (isSelected) {
                       return (
                          <div>
                              <div className="list-group-item selected" onClick={e => this.props.onClickStorage(e, s)}>
                                 <div id="storageName" className="media-body">
                                     <div>{s.name}</div>
                                 </div>
                              </div>
                              {s.folders.map(f => {
                                  const isSelected = f.path === this.props.currentFolderPath;
                                  return (
                                      <div
                                        className={isSelected ? "list-group-item selected" : "list-group-item"}
                                        onClick={e => this.props.onClickFolder(e, f)}
                                      >
                                          <div id="folderName" className="media-body">
                                              <div style={FOLDER_STYLE}>{f.name}</div>
                                          </div>
                                      </div>
                                  );
                              })}
                          </div>
                       );
                   } else {
                       return (
                          <div className="list-group-item" onClick={e => this.props.onClickStorage(e, s)}>
                            <div id="storageName" className="media-body">
                                 <div>{s.name}</div>
                             </div>
                          </div>
                       );
                   }
                })}
            </div>
        );
    }
    
}

