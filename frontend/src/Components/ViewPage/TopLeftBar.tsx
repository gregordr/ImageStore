import { IconButton } from "@material-ui/core";
import { ArrowBack } from "@material-ui/icons";
import React from "react";
import { useHistory, useLocation } from "react-router-dom";

export default function TopLeftBar() {
    const history = useHistory();
    const { search: queryUrl } = useLocation();

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
                    history.replace((history.location.pathname.split("/").splice(0, history.location.pathname.split("/").length - 2).join("/") || "/") + queryUrl);
                }}
            >
                <ArrowBack />
            </IconButton>
        </div>
    );
}
