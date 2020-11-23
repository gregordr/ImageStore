import React, { useState } from 'react';
import './TopBar.css';
import IconButton from '@material-ui/core/IconButton';
import { CloudDownload, LibraryAdd, Delete, Cancel, CloudUpload, Settings } from '@material-ui/icons';
import SearchBar from "material-ui-search-bar";
import { TextareaAutosize } from '@material-ui/core';

function RightSelectDiv(props: { buttonFunctions: any }) {
    return (
        <div className="right">
            <IconButton className="IconButton" color="primary" aria-label="cancel" onClick={props.buttonFunctions.unselect}>
                <Cancel />
            </IconButton>
            <IconButton className="IconButton" color="primary" aria-label="cloud_download">
                <CloudDownload />
            </IconButton>
            <IconButton className="IconButton" color="primary" aria-label="library_add">
                <LibraryAdd />
            </IconButton>
            <IconButton className="IconButton" color="primary" aria-label="delete" onClick={props.buttonFunctions.delete}>
                <Delete />
            </IconButton>
        </div>
    )
}
function RightNonSelectDiv(props: { buttonFunctions: any }) {
    return (
        <div className="right">
            <IconButton className="IconButton" color="primary" aria-label="upload" onClick={props.buttonFunctions.upload}>
                <CloudUpload />
            </IconButton>
            <IconButton className="IconButton" color="primary" aria-label="settings" onClick={props.buttonFunctions.settings}>
                <Settings />
            </IconButton>
        </div>
    )
}


export default function TopBar(props: any) {

    return (
        <div className="TopBar">
            <div className="middle">
                <SearchBar
                    value={""}
                    onChange={() => { }}
                    onRequestSearch={() => { }}
                /></div>
            <div className="rightHolder">{props.anySelected() ? <RightSelectDiv buttonFunctions={props.buttonFunctions} /> : <RightNonSelectDiv buttonFunctions={props.buttonFunctions} />} </div>
        </div >
    );
} 