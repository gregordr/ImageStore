import React from "react";
import IconButton from "@material-ui/core/IconButton";
import { CloudDownload, LibraryAdd, Delete, Cancel, CloudUpload, Settings, Search, CheckBox } from "@material-ui/icons";
import SearchBar from "material-ui-search-bar";
import { createStyles, makeStyles, Theme } from "@material-ui/core";
import TopBarStyle from "../Shared/TopBarStyle";

function RightSelectDiv(props: { buttonFunctions: any }) {
    return (
        <div className="right">
            <IconButton className="IconButton" color="primary" aria-label="cancel" onClick={props.buttonFunctions.unselect}>
                <Cancel />
            </IconButton>
            <IconButton className="IconButton" color="primary" aria-label="cloud_download">
                <CloudDownload />
            </IconButton>
            <IconButton className="IconButton" color="primary" aria-label="library_add" onClick={props.buttonFunctions.addToAlbum}>
                <LibraryAdd />
            </IconButton>
            <IconButton className="IconButton" color="primary" aria-label="delete" onClick={props.buttonFunctions.delete}>
                <Delete />
            </IconButton>
        </div>
    );
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
    );
}

export default function TopBar(props: any) {
    const classes = TopBarStyle();

    return (
        <div className={classes.TopBar}>
            <div className={classes.left}></div>
            <div className={classes.middle}>
                <SearchBar className={classes.notMobile} value="" onChange={() => {}} onRequestSearch={() => {}} />
            </div>
            <div className={classes.right}>
                {props.numSelected() === 0 && (
                    <div style={{ float: "left" }}>
                        <IconButton className={classes.onlyMobile} color="primary" aria-label="search" onClick={props.buttonFunctions.settings}>
                            <Search />
                        </IconButton>
                        <IconButton className={classes.onlyMobile} color="primary" aria-label="select" onClick={props.buttonFunctions.select}>
                            <CheckBox />
                        </IconButton>
                    </div>
                )}
                {props.numSelected() === 0 && (
                    <IconButton className="IconButton" color="primary" aria-label="upload" onClick={props.buttonFunctions.upload}>
                        <CloudUpload />
                    </IconButton>
                )}
                {props.numSelected() === 0 && (
                    <IconButton className="IconButton" color="primary" aria-label="settings" onClick={props.buttonFunctions.settings}>
                        <Settings />
                    </IconButton>
                )}
                {props.numSelected() !== 0 && (
                    <IconButton className="IconButton" color="primary" aria-label="cancel" onClick={props.buttonFunctions.unselect}>
                        <Cancel />
                    </IconButton>
                )}
                {props.numSelected() !== 0 && (
                    <IconButton className="IconButton" color="primary" aria-label="cloud_download">
                        <CloudDownload />
                    </IconButton>
                )}
                {props.numSelected() !== 0 && (
                    <IconButton className="IconButton" color="primary" aria-label="library_add" onClick={props.buttonFunctions.addToAlbum}>
                        <LibraryAdd />
                    </IconButton>
                )}
                {props.numSelected() !== 0 && (
                    <IconButton className="IconButton" color="primary" aria-label="delete" onClick={props.buttonFunctions.delete}>
                        <Delete />
                    </IconButton>
                )}
            </div>
        </div>
    );
}
