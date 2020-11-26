import React, { useState } from "react";
import Button from "@material-ui/core/Button";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogContentText from "@material-ui/core/DialogContentText";
import DialogTitle from "@material-ui/core/DialogTitle";
import useMediaQuery from "@material-ui/core/useMediaQuery";
import { makeStyles, useTheme } from "@material-ui/core/styles";
import { ListItem, ListItemAvatar, Avatar, ListItemText, Checkbox } from "@material-ui/core";

const useStyles = makeStyles({
    root: {
        "&:hover": {
            backgroundColor: "transparent",
        },
    },
});

function Element(props: any) {
    const classes = useStyles();
    const [checked, setChecked] = useState(false);
    return (
        <ListItem
            button
            onClick={() => {
                if (checked) props.remove(props.album.id);
                else props.add(props.album.id);
                setChecked(!checked);
            }}
            key={props.album.id}
        >
            <Checkbox className={classes.root} color="primary" checked={checked} disableRipple />
            <ListItemText primary={props.album.name} />
        </ListItem>
    );
}

export default function AddToAlbum(props: any) {
    const def: any[] = [];
    const [selected, setSelected] = useState(def);
    const theme = useTheme();
    const fullScreen = useMediaQuery(theme.breakpoints.down("sm"));

    const add = (album: any) => {
        const copy = selected.slice();
        copy.push(album);
        setSelected(copy);
    };
    const remove = (album: any) => {
        setSelected(selected.filter((cur) => cur !== album));
    };

    const handleClose = async () => {
        await props.cb(selected);
        setSelected([]);
        await props.setOpen(false);
    };

    return (
        <div>
            <Dialog fullScreen={fullScreen} open={props.open} onClose={handleClose} aria-labelledby="responsive-dialog-title">
                <DialogTitle id="responsive-dialog-title">{"Add to Album"}</DialogTitle>
                <DialogContent>
                    {props.albums.map((album: any) => (
                        <Element album={album} add={add} remove={remove} />
                    ))}
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose} color="primary" autoFocus>
                        Add
                    </Button>
                </DialogActions>
            </Dialog>
        </div>
    );
}
