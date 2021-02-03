import { IconButton, Tooltip } from "@material-ui/core";
import { CloudDownload, Delete, Info, LibraryAdd } from "@material-ui/icons";
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
            <Tooltip title="Info">
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
            </Tooltip>
            <Tooltip title="Download">
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
            </Tooltip>
            <Tooltip title="Add to album">
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
            </Tooltip>

            <Tooltip title="Delete">
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
            </Tooltip>
        </div>
    );
}
