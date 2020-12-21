import React, { useState } from "react";
import Button from "@material-ui/core/Button";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogTitle from "@material-ui/core/DialogTitle";
import useMediaQuery from "@material-ui/core/useMediaQuery";
import { makeStyles, useTheme } from "@material-ui/core/styles";
import { ListItem, ListItemText, Checkbox } from "@material-ui/core";
import { AlbumT } from "../../Interfaces";

const useStyles = makeStyles({
    root: {
        "&:hover": {
            backgroundColor: "transparent",
        },
    },
});

function Element(props: { album: AlbumT; remove: (arg0: any) => void; add: (arg0: any) => void }) {
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
        >
            <Checkbox className={classes.root} color="primary" checked={checked} disableRipple />
            <ListItemText primary={props.album.name} />
        </ListItem>
    );
}

export default function AddToAlbum(props: { cb: (arg0: string[]) => any; setOpen: (arg0: boolean) => any; open: boolean; albums: AlbumT[]; closeCallback?: (() => void) }) {
    const [selected, setSelected] = useState<string[]>([]);
    const theme = useTheme();
    const fullScreen = useMediaQuery(theme.breakpoints.down("sm"));

    const add = (albumId: string) => {
        setSelected([...selected, albumId]);
    };
    const remove = (albumId: string) => {
        setSelected(selected.filter((cur) => cur !== albumId));
    };

    const handleClose = (execute: boolean) => async () => {
        if (execute && selected.length > 0) await props.cb(selected);
        setSelected([]);
        await props.setOpen(false);
        props.closeCallback?.()
    };

    return (
        <div>
            <Dialog fullScreen={fullScreen} open={props.open} onClose={handleClose(false)} style={{ zIndex: 1000000 }} aria-labelledby="responsive-dialog-title">
                <DialogTitle id="responsive-dialog-title">Add to Album</DialogTitle>
                <DialogContent>
                    {props.albums.map((album: any) => (
                        <Element album={album} add={add} remove={remove} key={album.id} />
                    ))}
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose(true)} color="primary" autoFocus>
                        Add
                    </Button>
                </DialogActions>
            </Dialog>
        </div>
    );
}
