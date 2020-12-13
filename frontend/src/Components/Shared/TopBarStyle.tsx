import { makeStyles, Theme, createStyles } from "@material-ui/core";

export default makeStyles((theme: Theme) =>
    createStyles({
        TopBar: {
            background: "#ffffff",
            display: "flex",
            flexGrow: 1,
        },
        left: {
            transition: "all 1s linear",
            padding: "7px",
            display: "block",
            float: "left",
            "margin-left": "-15px",
            "margin-right": "-5px",
            "padding-left": "0px",
        },
        middle: {
            flexGrow: 1,
            display: "block",
            float: "left",
            padding: "7px",
            [theme.breakpoints.down("sm")]: {
                padding: "0px",
            },
        },
        right: {
            transition: "all 1s linear",
            padding: "7px",
            display: "block",
            justifySelf: "flex-end",
            "margin-right": "-15px",
            "padding-right": "0px",
        },
        onlyMobile: {
            [theme.breakpoints.up("md")]: {
                display: "none",
            },
        },
        notMobile: {
            [theme.breakpoints.down("sm")]: {
                display: "none",
            },
        },
    })
);
