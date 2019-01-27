import React from "react";
import { ipcRenderer } from "electron";
import CreateStorageDialog from "./CreateStorageDialog";
import CreateFolderDialog from "./CreateFolderDialog";

const STORAGE_LIST_STYLE = {
    width: "10%",
    padding: "1px",
};

const STYLE_FLEX_DIRECTION_ROW = {
    "flex-direction": "row",
};

const STYLE_HEADER = {
    "border-bottom": "solid #ddd 1px",
    "font-size": "16px",
};

const FOLDER_STYLE = {
    "text-indent": "0.5em",
};

export default class StorageList extends React.Component {

    constructor(props) {
        super(props);
    }

    render() {
        return (
            <div className="list-group" style={STORAGE_LIST_STYLE}>
                <div className="list-group-header" style={STYLE_HEADER}>
                    <div style={STYLE_FLEX_DIRECTION_ROW}>
                        <strong>Storages</strong>
                        <CreateStorageDialog createStorage={this.props.createStorage} />
                    </div>
                </div>
                {this.props.storages.map(s => {
                   const isSelected = s.path === this.props.currentStoragePath;
                   if (isSelected) {
                       return (
                          <div>
                              <div className="list-group-item selected" onClick={e => this.props.onClickStorage(e, s)}>
                                 <span className="media-object icon icon-database pull-left" />
                                 <div id="storageName" className="media-body">
                                     <div>{s.name}</div>
                                     <CreateFolderDialog createFolder={this.props.createFolder} />
                                 </div>
                              </div>
                              {s.folders.map(f => {
                                  const isSelected = f.path === this.props.currentFolderPath;
                                  console.log("f.path: " + f.path + "    currentFolderPath: " + this.props.currentFolderPath);
                                  return (
                                      <div
                                        style={FOLDER_STYLE}
                                        className={isSelected ? "list-group-item selected" : "list-group-item"}
                                        onClick={e => this.props.onClickFolder(e, f)}
                                      >
                                          <span className="media-object icon icon-folder pull-left" />
                                          <div id="folderName" className="media-body">
                                              <div>{f.name}</div>
                                          </div>
                                      </div>
                                  );
                              })}
                          </div>
                       );
                   } else {
                       return (
                          <div className="list-group-item" onClick={e => this.props.onClickStorage(e, s)}>
                            <span className="media-object icon icon-database pull-left" />
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

