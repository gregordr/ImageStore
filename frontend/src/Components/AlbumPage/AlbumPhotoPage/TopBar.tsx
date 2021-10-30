import React, { useState } from "react";
import IconButton from "@material-ui/core/IconButton";
import { CloudDownload, LibraryAdd, Delete, Cancel, CloudUpload, Search, CheckBox, RemoveCircleOutline, Pages, ArrowBack, Label } from "@material-ui/icons";
import SearchBar from "material-ui-search-bar";
import { useHistory } from "react-router-dom";
import TopBarStyle from "../../Shared/TopBarStyle";
import { LinearProgress, Tooltip } from "@material-ui/core";
import AutocompleteSearchBar from "../../Shared/SearchBar";

export default function TopBar(props: any) {
    const classes = TopBarStyle();
    const history = useHistory();

    return (
        <div style={{ display: "flex", flexDirection: "column", flexGrow: 1 }}>
            <div className={classes.TopBar}>
                <div className={classes.left}>
                    {props.numSelected() === 0 && (
                        <IconButton style={{ float: "left" }} aria-label="back" onClick={() => history.replace(history.location.pathname.split("/").splice(0, history.location.pathname.split("/").length-2).join("/"))} className="IconButton">
                            <ArrowBack />
                        </IconButton>
                    )}
                </div>
                <div className={classes.middle}>
                    <AutocompleteSearchBar
                        options={props.autocompleteOptions}
                        search={props.buttonFunctions.search}
                        className={classes.notMobile}
                        value={props.searchBarText}
                        onChange={(s: string) => props.setSearchBarText(s)}
                        onRequestSearch={props.buttonFunctions.search(props.searchBarText)}
                    />
                </div>
                <div className={classes.right}>
                    <div style={{ float: "left" }}>
                        <IconButton className={classes.onlyMobile} color="primary" aria-label="search" onClick={props.buttonFunctions.mobileSearch}>
                            <Search />
                        </IconButton>
                        {props.numSelected() === 0 && (
                            <Tooltip title="Select images">
                                <IconButton className={classes.onlyMobile} color="primary" aria-label="select" onClick={props.buttonFunctions.select}>
                                    <CheckBox />
                                </IconButton>
                            </Tooltip>
                        )}
                    </div>
                    {props.numSelected() === 1 && (
                        <Tooltip title="Set as album cover">
                            <IconButton className="IconButton" color="primary" aria-label="set as cover" onClick={props.buttonFunctions.setCover}>
                                <Pages />
                            </IconButton>
                        </Tooltip>
                    )}
                    {props.numSelected() === 0 && (
                        <Tooltip title="Upload images">
                            <IconButton className="IconButton" color="primary" aria-label="upload" onClick={props.buttonFunctions.upload}>
                                <CloudUpload />
                            </IconButton>
                        </Tooltip>
                    )}
                    {props.numSelected() !== 0 && (
                        <Tooltip title="Unselect">
                            <IconButton className="IconButton" color="primary" aria-label="cancel" onClick={props.buttonFunctions.unselect}>
                                <Cancel />
                            </IconButton>
                        </Tooltip>
                    )}
                    {props.numSelected() !== 0 && (
                        <Tooltip title="Download">
                            <IconButton className="IconButton" color="primary" aria-label="cloud_download" onClick={props.buttonFunctions.download}>
                                <CloudDownload />
                            </IconButton>
                        </Tooltip>
                    )}
                    {props.numSelected() !== 0 && (
                        <Tooltip title="Add to album">
                            <IconButton className="IconButton" color="primary" aria-label="library_add" onClick={props.buttonFunctions.addToAlbum}>
                                <LibraryAdd />
                            </IconButton>
                        </Tooltip>
                    )}
                    {props.numSelected() !== 0 && (
                        <Tooltip title="Add labels">
                            <IconButton className="IconButton" color="primary" aria-label="label" onClick={props.buttonFunctions.label}>
                                <Label />
                            </IconButton>
                        </Tooltip>
                    )}
                    {props.numSelected() !== 0 && (
                        <Tooltip title="Remove from album">
                            <IconButton className="IconButton" color="primary" aria-label="remove" onClick={props.buttonFunctions.remove}>
                                <RemoveCircleOutline />
                            </IconButton>
                        </Tooltip>
                    )}
                    {props.numSelected() !== 0 && (
                        <Tooltip title="Delete">
                            <IconButton className="IconButton" color="primary" aria-label="delete" onClick={props.buttonFunctions.delete}>
                                <Delete />
                            </IconButton>
                        </Tooltip>
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
