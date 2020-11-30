import React from "react";
import IconButton from "@material-ui/core/IconButton";
import { CloudDownload, LibraryAdd, Delete, Cancel, CloudUpload, Settings, Search, CheckBox, RemoveCircleOutline, Pages, ArrowBack } from "@material-ui/icons";
import SearchBar from "material-ui-search-bar";
import { useHistory } from "react-router-dom";
import TopBarStyle from "../../Shared/TopBarStyle";

export default function TopBar(props: any) {
    const classes = TopBarStyle();
    const history = useHistory();

    return (
        <div className={classes.TopBar}>
            <div className={classes.left}>
                {props.numSelected() === 0 && (
                    <IconButton style={{ float: "left" }} aria-label="back" onClick={() => history.goBack()} className="IconButton">
                        <ArrowBack />
                    </IconButton>
                )}
            </div>
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
                {props.numSelected() === 1 && (
                    <IconButton className="IconButton" color="primary" aria-label="set as cover" onClick={props.buttonFunctions.setCover}>
                        <Pages />
                    </IconButton>
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
                    <IconButton className="IconButton" color="primary" aria-label="remove" onClick={props.buttonFunctions.remove}>
                        <RemoveCircleOutline />
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
