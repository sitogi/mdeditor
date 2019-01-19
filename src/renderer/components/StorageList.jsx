import React from "react";
import { ipcRenderer } from "electron";

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
        this.state = {
            currentStoragePath: "",
            storages: [],
            currentFolderPath: ""
        };

       this.handleOnSubmit = this.handleOnSubmit.bind(this);
    }

    componentDidMount() {
        this.getStorageList();
    }

    handleOnSubmit(e) {
        // TODO
        ipcRenderer.send("NEW_STORAGE");
        const storages = this.state.storages;
     //   storages.push({ path: "name" });
     //   this.setState({ storages });
        
    }

    onClickStorage(e, storage) {
        this.setState(
            { 
                currentStoragePath: storage.path,
                currentFolderPath: ""
            }
        );
    };

    onClickFolder(e, folder) {
        this.setState({ currentFolderPath: folder.path });
    };

    getStorageList() {
        ipcRenderer.send("GET_STORAGES");
        ipcRenderer.on("SEND_STORAGES", (event, storages) => {
            this.setState({ storages: storages });
        });
    }

    render() {
        return (
            <div className="list-storage">
                <div className="list-storage-header">
                    <form style={FORM_STYLE} onSubmit={this.handleOnSubmit}>
                        <strong>Storage </strong>
                        <button className="btn btn-default" style={BUTTON_STYLE}>
                            <span className="icon icon-plus" />
                        </button>
                    </form>
                </div>
                {this.state.storages.map(s => {
                   const isSelected = s.path === this.state.currentStoragePath;
                   if (isSelected) {
                       return (
                          <div>
                              <div className="list-group-item selected" onClick={e => this.onClickStorage(e, s)}>
                                 <div id="storageName" className="media-body">
                                     <div>{s.name}</div>
                                 </div>
                              </div>
                              {s.folders.map(f => {
                                  const isSelected = f.path === this.state.currentFolderPath;
                                  return (
                                      <div
                                        className={isSelected ? "list-group-item selected" : "list-group-item"}
                                        onClick={e => this.onClickFolder(e, f)}
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
                          <div className="list-group-item" onClick={e => this.onClickStorage(e, s)}>
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

