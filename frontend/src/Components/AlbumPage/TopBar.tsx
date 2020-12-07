import React, { useState } from "react";
import IconButton from "@material-ui/core/IconButton";
import { Search, CreateNewFolder } from "@material-ui/icons";
import SearchBar from "material-ui-search-bar";
import TopBarStyle from "../Shared/TopBarStyle";

export default function TopBar(props: any) {
    const classes = TopBarStyle();

    const [searchBarText, setSearchBarText] = useState("");
    return (
        <div className={classes.TopBar}>
            <div className={classes.middle}>
                <SearchBar className={classes.notMobile} value={searchBarText} onChange={(s) => setSearchBarText(s)} onRequestSearch={props.buttonFunctions.search(searchBarText)} />
            </div>
            <div className={classes.right}>
                <IconButton className={classes.onlyMobile} color="primary" aria-label="search" onClick={props.buttonFunctions.settings}>
                    <Search />
                </IconButton>
                <IconButton className="IconButton" color="primary" aria-label="add" onClick={props.buttonFunctions.add}>
                    <CreateNewFolder />
                </IconButton>
            </div>
        </div>
    );
}
