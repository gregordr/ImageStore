import React, { useState } from "react";
import IconButton from "@material-ui/core/IconButton";
import { Search, CreateNewFolder } from "@material-ui/icons";
import SearchBar from "material-ui-search-bar";
import TopBarStyle from "../Shared/TopBarStyle";
import { LinearProgress, Tooltip } from "@material-ui/core";
import AutocompleteSearchBar from "../Shared/SearchBar";

export default function TopBar(props: any) {
    const classes = TopBarStyle();

    return (
        <div style={{ display: "flex", flexDirection: "column", flexGrow: 1 }}>
            <div className={classes.TopBar}>
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
                    <IconButton className={classes.onlyMobile} color="primary" aria-label="search" onClick={props.buttonFunctions.mobileSearch}>
                        <Search />
                    </IconButton>

                    <Tooltip title="Create new album">
                        <IconButton className="IconButton" color="primary" aria-label="add" onClick={props.buttonFunctions.add}>
                            <CreateNewFolder />
                        </IconButton>
                    </Tooltip>
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
