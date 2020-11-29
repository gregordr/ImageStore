import React, { useState } from "react";
import "./TopBar.css";
import IconButton from "@material-ui/core/IconButton";
import { CloudDownload, LibraryAdd, Delete, Cancel, CloudUpload, Settings, Search, CheckBox, CreateNewFolder } from "@material-ui/icons";
import SearchBar from "material-ui-search-bar";
import { createStyles, makeStyles, Theme } from "@material-ui/core";

function RightDiv(props: { buttonFunctions: any }) {
    return (
        <div className="right">
            <IconButton className="IconButton" color="primary" aria-label="add" onClick={props.buttonFunctions.add}>
                <CreateNewFolder />
            </IconButton>
        </div>
    );
}

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        TopBar: {
            "grid-area": "TopBar",
            background: "#ffffff",
            display: "grid",
            "grid-template-columns": "1fr 1fr",
            [theme.breakpoints.down("sm")]: {
                "grid-template-columns": "0fr 1fr",
            },
            "grid-template-rows": "1fr",
            gap: "0px 0px",
            gridTemplateAreas: '"middle right"',
            width: "100vw",
        },
        middle: {
            display: "block",
            width: "40vw",
            [theme.breakpoints.down("sm")]: {
                display: "none",
            },
            "grid-area": "middle",
            "padding-top": "8px",
        },
        searchMobile: {
            [theme.breakpoints.up("md")]: {
                display: "none",
            },
            transition: "all 1s linear",
            padding: "7px",
            display: "block",
            float: "right",
            "margin-right": "-15px",
            "padding-right": "0px",
        },
        right: {
            transition: "all 1s linear",
            padding: "7px",
            display: "block",
            float: "right",
            "margin-right": "-15px",
            "padding-right": "0px",
        },
        selectMobile: {
            [theme.breakpoints.up("md")]: {
                display: "none",
            },
            transition: "all 1s linear",
            padding: "7px",
            display: "block",
            float: "right",
            "margin-right": "-15px",
            "padding-right": "0px",
        },
    })
);

export default function TopBar(props: any) {
    const classes = useStyles();

    return (
        <div className={classes.TopBar}>
            <div className={classes.middle}>
                <SearchBar value="" onChange={() => {}} onRequestSearch={() => {}} />
            </div>
            <div className="rightHolder">
                <RightDiv buttonFunctions={props.buttonFunctions} />

                <div className={classes.searchMobile}>
                    <IconButton className="IconButton" color="primary" aria-label="search" onClick={props.buttonFunctions.settings}>
                        <Search />
                    </IconButton>
                </div>
            </div>
        </div>
    );
}
