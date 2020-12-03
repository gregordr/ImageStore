import { createStyles, IconButton, makeStyles, Theme } from "@material-ui/core";
import { ArrowBack } from "@material-ui/icons";
import React from "react";
import { useHistory } from "react-router-dom";

export default function TopLeftBar(props: any) {
    const history = useHistory();

    return (
        <div
            className="TopLeftBar"
            style={{
                alignSelf: "flex-start",
                justifySelf: "left",
                padding: 10,
                marginRight: -25,
            }}
        >
            <IconButton
                className="IconButton"
                color="primary"
                aria-label="back"
                onClick={(e) => {
                    e.stopPropagation();
                    history.goBack();
                }}
            >
                <ArrowBack />
            </IconButton>
        </div>
    );
}
