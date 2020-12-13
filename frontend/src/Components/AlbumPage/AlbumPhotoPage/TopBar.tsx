import React, { useState } from "react";
import IconButton from "@material-ui/core/IconButton";
import { CloudDownload, LibraryAdd, Delete, Cancel, CloudUpload, Settings, Search, CheckBox, RemoveCircleOutline, Pages, ArrowBack } from "@material-ui/icons";
import SearchBar from "material-ui-search-bar";
import { useHistory } from "react-router-dom";
import TopBarStyle from "../../Shared/TopBarStyle";
import { LinearProgress } from "@material-ui/core";

export default function TopBar(props: any) {
    const classes = TopBarStyle();
    const history = useHistory();
    const [searchBarText, setSearchBarText] = useState("");

    return (
        <div style={{ display: "flex", flexDirection: "column", flexGrow: 1 }}>
            <div className={classes.TopBar}>
                <div className={classes.left}>
                    {props.numSelected() === 0 && (
                        <IconButton style={{ float: "left" }} aria-label="back" onClick={() => history.goBack()} className="IconButton">
                            <ArrowBack />
                        </IconButton>
                    )}
                </div>
                <div className={classes.middle}>
                    <SearchBar
                        onCancelSearch={async () => {
                            setSearchBarText("");
                            props.buttonFunctions.search("")();
                        }}
                        className={classes.notMobile}
                        value={searchBarText}
                        onChange={(s) => setSearchBarText(s)}
                        onRequestSearch={props.buttonFunctions.search(searchBarText)}
                    />
                </div>
                <div className={classes.right}>
                    <div style={{ float: "left" }}>
                        <IconButton className={classes.onlyMobile} color="primary" aria-label="search" onClick={props.buttonFunctions.mobileSearch}>
                            <Search />
                        </IconButton>
                        {props.numSelected() === 0 && (
                            <IconButton className={classes.onlyMobile} color="primary" aria-label="select" onClick={props.buttonFunctions.select}>
                                <CheckBox />
                            </IconButton>
                        )}
                    </div>
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
                    {props.numSelected() !== 0 && (
                        <IconButton className="IconButton" color="primary" aria-label="cancel" onClick={props.buttonFunctions.unselect}>
                            <Cancel />
                        </IconButton>
                    )}
                    {props.numSelected() !== 0 && (
                        <IconButton className="IconButton" color="primary" aria-label="cloud_download" onClick={props.buttonFunctions.download}>
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
            <LinearProgress
                style={{
                    marginTop: -2,
                    display: props.show ? "block" : "none",
                    flexGrow: 1,
                    marginLeft: -24,
                    marginRight: -24,
                }}
            />
        </div>
    );
}
