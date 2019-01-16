import React from "react";
import { ipcRenderer } from "electron";

const FORM_STYLE = {
    display: "flex"
};

const BUTTON_STYLE = {
    margin: 10
};

export default class StorageList extends React.Component {

   constructor(props) {
        super(props);
        this.state = {
            currentStorageId: "",
            storages: [ { key: "key1", name: "name1" }, { key: "key2", name: "name2" } ]
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
        storages.push({ key: "key", name: "name" });
        this.setState({ storages });
        
    }

    onClick(e, storage) {
        this.setState({ currentStorageId: storage.key });
    };

    getStorageList() {
        ipcRenderer.send("GET_STORAGE_LIST");
        // TODO
    }

    render() {
        const Id = "key2";

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
                   return (
//                    <StorageItem storage={s} selected={s.name === this.state.currentStorageId} onClick={this.onClick} />
                      <div className={s.key === this.state.currentStorageId ? "list-group-item selected" : "list-group-item"}
                           onClick={e => this.onClick(e, s)}
                      >
                         <div id="storageName" className="media-body">
                             <strong>{s.name}</strong>
                         </div>
                     </div>
                  );
                })}
            </div>
        );
    }
    
}

