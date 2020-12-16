import { IconButton } from "@material-ui/core";
import { CloudDownload, Delete, Info, LibraryAdd, Pages, RemoveCircleOutline } from "@material-ui/icons";
import React from "react";

export default function TopRightBar(props: any) {
    return (
        <div
            className="TopRightBar"
            style={{
                alignSelf: "flex-start",
                justifySelf: "right",
                padding: 10,
            }}
        >
            <IconButton
                className="IconButton"
                color="primary"
                aria-label="info"
                onClick={(e) => {
                    e.stopPropagation();
                    props.buttonFunctions.info();
                }}
            >
                <Info />
            </IconButton>
            <IconButton
                className="IconButton"
                color="primary"
                aria-label="set cover"
                onClick={(e) => {
                    e.stopPropagation();
                    props.buttonFunctions.setCover(props.id);
                }}
            >
                <Pages />
            </IconButton>
            <IconButton
                className="IconButton"
                color="primary"
                aria-label="download"
                onClick={(e) => {
                    e.stopPropagation();
                    props.buttonFunctions.download(props.id);
                }}
            >
                <CloudDownload />
            </IconButton>
            <IconButton
                className="IconButton"
                color="primary"
                aria-label="library_add"
                onClick={(e) => {
                    e.stopPropagation();
                    props.buttonFunctions.addToAlbum(props.id);
                }}
            >
                <LibraryAdd />
            </IconButton>
            <IconButton
                className="IconButton"
                color="primary"
                aria-label="remove"
                onClick={(e) => {
                    e.stopPropagation();
                    props.buttonFunctions.remove(props.id);
                }}
            >
                <RemoveCircleOutline />
            </IconButton>
            <IconButton
                className="IconButton"
                color="primary"
                aria-label="delete"
                onClick={(e) => {
                    e.stopPropagation();
                    props.buttonFunctions.delete(props.id);
                }}
            >
                <Delete />
            </IconButton>
        </div>
    );
}
