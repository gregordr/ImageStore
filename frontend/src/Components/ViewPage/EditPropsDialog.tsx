import React, { useEffect, useState } from "react";
import Button from "@material-ui/core/Button";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogTitle from "@material-ui/core/DialogTitle";
import useMediaQuery from "@material-ui/core/useMediaQuery";
import { makeStyles, useTheme } from "@material-ui/core/styles";
import { ListItem, ListItemText, Checkbox, TextField } from "@material-ui/core";
import { AlbumT, PhotoT } from "../../Interfaces";
import CreateAlbum from "../AlbumPage/CreateAlbum";
import { createAlbum } from "../../API";
import moment from "moment";
import { isConstructorDeclaration } from "typescript";
import isValid from "is-valid-path";

const useStyles = makeStyles({
    root: {
        "&:hover": {
            backgroundColor: "transparent",
        },
    },
});

export default function EditPropsDialog(props: { cb: (name: string, number: number) => any; setOpen: (arg0: boolean) => any; open: boolean; photo: PhotoT }) {
    const theme = useTheme();
    const fullScreen = useMediaQuery(theme.breakpoints.down("sm"));
    const [name, setName] = useState("");
    const [date, setDate] = useState(moment.utc().format("YYYY-MM-DDTHH:mm:ss"));

    useEffect(() => {
        setName(props.photo?.name);
        if (props.photo) setDate(moment.unix(props.photo.date).format("YYYY-MM-DDTHH:mm:ss"));
    }, [props.photo]);

    const handleClose = (execute: boolean) => async () => {
        if (execute && isDateCorrect() && isNameCorrect() && (name !== props.photo.name || date !== moment.unix(props.photo.date).format("YYYY-MM-DDTHH:mm:ss")))
            await props.cb(name, moment(date).unix());
        setName(props.photo?.name);
        if (props.photo) setDate(moment.unix(props.photo.date).format("YYYY-MM-DDTHH:mm:ss"));
        await props.setOpen(false);
    };

    const isNameCorrect = () => {
        return isValid(name) && name.length !== 0 && !name.includes("/") && !name.includes("\\");
    };

    const isDateCorrect = () => {
        return moment(date).unix() ? true : false;
    };

    return (
        <div>
            <Dialog
                onKeyPress={(ev) => {
                    if (ev.key === "Enter") {
                        if (isDateCorrect() && isNameCorrect()) {
                            handleClose(true)();
                        }
                        ev.preventDefault();
                    }
                }}
                fullScreen={fullScreen}
                open={props.open}
                onClose={handleClose(false)}
                style={{ zIndex: 1000000 }}
                aria-labelledby="responsive-dialog-title"
            >
                <DialogTitle id="responsive-dialog-title">Change image properties</DialogTitle>
                <DialogContent>
                    <div
                        style={{
                            display: "flex",
                            flexDirection: "column",
                        }}
                    >
                        <TextField
                            id="name"
                            label="Name"
                            type="text"
                            value={name}
                            onChange={(event: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
                                setName(event.target.value);
                            }}
                            InputLabelProps={{
                                shrink: true,
                            }}
                        />

                        <TextField
                            id="datetime-local"
                            label="Time taken"
                            type="datetime-local"
                            value={date}
                            onChange={(event: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
                                setDate(event.target.value);
                            }}
                            InputLabelProps={{
                                shrink: true,
                            }}
                        />
                        <div style={{ marginTop: 10, color: "red" }}>{isDateCorrect() || "Invalid date"}</div>
                        <div style={{ color: "red" }}>{isNameCorrect() || "Invalid name"}</div>
                    </div>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose(false)} color="primary">
                        Cancel
                    </Button>
                    <Button onClick={handleClose(true)} color="primary" autoFocus disabled={!isNameCorrect() || !isDateCorrect()}>
                        Ok
                    </Button>
                </DialogActions>
            </Dialog>
        </div>
    );
}
