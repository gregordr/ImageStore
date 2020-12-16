import React, { useState } from "react";
import IconButton from "@material-ui/core/IconButton";
import { CloudDownload, LibraryAdd, Delete, Cancel, CloudUpload, Search, CheckBox } from "@material-ui/icons";
import SearchBar from "material-ui-search-bar";
import { LinearProgress } from "@material-ui/core";
import TopBarStyle from "../Shared/TopBarStyle";

export default function TopBar(props: any) {
    const classes = TopBarStyle();

    const [searchBarText, setSearchBarText] = useState("");

    return (
        <div style={{ display: "flex", flexDirection: "column", flexGrow: 1 }}>
            <div className={classes.TopBar}>
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
