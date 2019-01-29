import React from "react";
import { ipcRenderer } from "electron";
import CreateStorageDialog from "./CreateStorageDialog";
import CreateFolderDialog from "./CreateFolderDialog";
import showContextMenu from "./showContextMenu";

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
        this.deleteStorage = this.deleteStorage.bind(this);
        this.deleteFolder = this.deleteFolder.bind(this);
    }

    deleteStorage(path) {
        // TODO 本来はダイアログを出すぐらい慎重になるべき
        ipcRenderer.sendSync("DELETE_STORAGE", path);
        this.props.refreshStorages();
    }

    deleteFolder(path) {
        // TODO 本来はダイアログを出すぐらい慎重になるべき
        ipcRenderer.sendSync("DELETE_FOLDER", path);
        this.props.refreshStorages();
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
                              <div
                                  className="list-group-item selected"
                                  onClick={e => this.props.onClickStorage(e, s)}
                                  onContextMenu={e => {
                                      showContextMenu(e, [{ label: "Delete", action: () => this.deleteStorage(s.path) }]);
                                  }}
                              >
                                 <span className="media-object icon icon-database pull-left" />
                                 <div id="storageName" className="media-body">
                                     <div>{s.name}</div>
                                     <CreateFolderDialog createFolder={this.props.createFolder} />
                                 </div>
                              </div>
                              {s.folders.map(f => {
                                  const isSelected = f.path === this.props.currentFolderPath;
                                  return (
                                      <div
                                        style={FOLDER_STYLE}
                                        className={isSelected ? "list-group-item selected" : "list-group-item"}
                                        onClick={e => this.props.onClickFolder(e, f)}
                                        onContextMenu={e => {
                                            showContextMenu(e, [{ label: "Delete", action: () => this.deleteFolder(f.path) }]);
                                        }}
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
                          <div
                              className="list-group-item"
                              onClick={e => this.props.onClickStorage(e, s)}
                              onContextMenu={e => showContextMenu(e, s.path)}
                          >
                            <span className="media-object icon icon-database pull-left"  />
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

