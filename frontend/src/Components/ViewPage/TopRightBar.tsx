import { createStyles, IconButton, makeStyles, Theme } from "@material-ui/core";
import { ArrowBack, Delete, LibraryAdd } from "@material-ui/icons";
import React from "react";
import "./TopRightBar.css";

export default function TopRightBar(props: any) {
    return (
        <div className="TopRightBar">
            <IconButton
                className="IconButton"
                color="primary"
                aria-label="library_add"
                onClick={(e) => {
                    e.stopPropagation();
                    props.addToAlbum(props.id);
                }}
            >
                <LibraryAdd />
            </IconButton>
            <IconButton
                className="IconButton"
                color="primary"
                aria-label="delete"
                onClick={(e) => {
                    e.stopPropagation();
                    props.delete(props.id);
                }}
            >
                <Delete />
            </IconButton>
        </div>
    );
}
