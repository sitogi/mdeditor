import React from "react";
import Modal from "react-modal";
import ipcRenderer from "electron";

export default class CreateStorageDialog extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            modalIsOpen: false,
        };
      
        this.openModal = this.openModal.bind(this);
        this.afterOpenModal = this.afterOpenModal.bind(this);
        this.closeModal = this.closeModal.bind(this);
        this.createStorage = this.createStorage.bind(this);
    }
    
    openModal() {
        this.setState({modalIsOpen: true});
    }
    
    afterOpenModal() {
        // references are now sync'd and can be accessed.
        // this.subtitle.style.color = '#f00';
    }
    
    closeModal() {
        this.setState({modalIsOpen: false});
    }

    createStorage(e) {
        const name = document.getElementById("sName").value; // storageName だとなぜか取得できない
        const path = document.getElementById("storagePath").value;
        // TODO エラーをキャッチしてモーダルを閉じないようにする
        this.props.createStorage({name: name, path: path});
        this.closeModal();
    }

    render() {
        return (
            <div>
                <span className="icon icon-plus-squared pull-right" onClick={this.openModal}/>
                <Modal
                  isOpen={this.state.modalIsOpen}
                  onAfterOpen={this.afterOpenModal}
                  onRequestClose={this.closeModal}
                  contentLabel="Create Storage"
                >
                  <div>Create Storage</div> <br/>
                  name: 
                  <input type="text" id="sName"/> <br/>
                  path: 
                  <input type="text" id="storagePath"/> <br/>
                  <button onClick={this.createStorage}>Create</button>
                  <button onClick={this.closeModal}>Cancel</button>
                </Modal>
            </div>
        );
    }

}

