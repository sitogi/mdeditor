import React from "react";
import { ipcRenderer } from "electron";

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
        this.handleOnClick = this.handleOnClick.bind(this);
    }

    handleOnClick(e) {
        // TODO
        ipcRenderer.send("NEW_STORAGE");
    }

    render() {
        return (
            <div className="list-group">
                <div className="list-group-header" style={STYLE_HEADER}>
                    <div>
                        <strong>Storages</strong>
                        <span className="icon icon-plus-squared pull-right" onClick={this.handleOnClick}/>
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
                                 </div>
                              </div>
                              {s.folders.map(f => {
                                  const isSelected = f.path === this.props.currentFolderPath;
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

