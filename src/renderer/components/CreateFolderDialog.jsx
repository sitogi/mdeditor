import React from "react";
import Modal from "react-modal";
import ipcRenderer from "electron";

export default class CreateFolderDialog extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            modalIsOpen: false,
        };
      
        this.openModal = this.openModal.bind(this);
        this.afterOpenModal = this.afterOpenModal.bind(this);
        this.closeModal = this.closeModal.bind(this);
        this.createFolder = this.createFolder.bind(this);
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

    createFolder(e) {
        const folderName = document.getElementById("fname").value;
        // TODO エラーをキャッチしてモーダルを閉じないようにする
        this.props.createFolder(folderName);
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
                  contentLabel="Create Folder"
                >
                  <div>Create Folder</div> <br/>
                  name: 
                  <input type="text" id="fname"/> <br/>
                  <button onClick={this.createFolder}>Create</button>
                  <button onClick={this.closeModal}>Cancel</button>
                </Modal>
            </div>
        );
    }

}

