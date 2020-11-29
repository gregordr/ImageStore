import React, { useState } from "react";
import Button from "@material-ui/core/Button";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogTitle from "@material-ui/core/DialogTitle";
import useMediaQuery from "@material-ui/core/useMediaQuery";
import { makeStyles, useTheme } from "@material-ui/core/styles";
import { ListItem, ListItemText, Checkbox, TextField } from "@material-ui/core";
import { AlbumT } from "../../Interfaces";

export default function CreateAlbum(props: { cb: (arg0: string) => any; setOpen: (arg0: boolean) => any; open: boolean; albums: AlbumT[] }) {
    const theme = useTheme();
    const fullScreen = useMediaQuery(theme.breakpoints.down("sm"));

    const handleClose = (execute: boolean) => async () => {
        if (execute) await props.cb(value);
        setValue("");
        await props.setOpen(false);
    };
    const [value, setValue] = React.useState("");

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setValue(event.target.value);
    };

    return (
        <div>
            <Dialog fullWidth fullScreen={fullScreen} open={props.open} onClose={handleClose(false)} aria-labelledby="responsive-dialog-title">
                <DialogTitle id="responsive-dialog-title">Add to Album</DialogTitle>
                <DialogContent>
                    <TextField label="Name your album" placeholder="My new album" multiline variant="filled" value={value} onChange={handleChange} fullWidth autoFocus margin="dense" />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose(true)} color="primary">
                        Add
                    </Button>
                </DialogActions>
            </Dialog>
        </div>
    );
}
