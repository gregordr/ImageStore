import React, { useState } from "react";
import Button from "@material-ui/core/Button";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogTitle from "@material-ui/core/DialogTitle";
import useMediaQuery from "@material-ui/core/useMediaQuery";
import { useTheme } from "@material-ui/core/styles";
import { TextField } from "@material-ui/core";
import { AlbumT } from "../../Interfaces";

export default function CreateFolder(props: { cb: (arg0: string) => any; setOpen: (arg0: boolean) => any; open: boolean; }) {
    const [done, setDone] = useState(false);
    const theme = useTheme();
    const fullScreen = useMediaQuery(theme.breakpoints.down("sm"));

    const handleClose = (execute: boolean) => async () => {
        if (done)
            return;
        if (value === "") {
            await props.setOpen(false);
            return;
        }
        if (execute) {
            setDone(true);
            await props.cb(value);
        }
        setValue("");
        await props.setOpen(false);
        setDone(false);
    };
    const [value, setValue] = React.useState("");

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setValue(event.target.value);
    };

    return (
        <div>
            <Dialog
                fullWidth
                fullScreen={fullScreen}
                style={{ zIndex: 1000001 }}
                open={props.open}
                onClose={handleClose(false)}
                aria-labelledby="responsive-dialog-title"
                onKeyPress={(ev) => {
                    if (ev.key === "Enter") {
                        handleClose(true)();
                    }
                }}
            >
                <DialogTitle id="responsive-dialog-title">Create new Folder</DialogTitle>
                <DialogContent>
                    <TextField label="Name your folder" placeholder="New album" variant="filled" value={value} onChange={handleChange} fullWidth autoFocus margin="dense" />
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
