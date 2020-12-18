import { Button, CircularProgress, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from "@material-ui/core";
import { OptionsObject } from "notistack";
import React from "react";
import { addPhotosToAlbums } from "../../API";
import { AlbumT } from "../../Interfaces";
import AddToAlbum from "../Shared/AddToAlbum";
import SnackbarAction from "./SnackbarAction";

function DialogComponent(props: any) {
    const [open, setOpen] = React.useState(false);

    const cb = async (albumIds: any) => {
        await addPhotosToAlbums(props.photos, albumIds, props.enqueueSnackbar, props.closeSnackbar);
    };

    return (
        <div>
            <Button color="inherit" onClick={() => setOpen(true)}>
                Add to album
            </Button>
            <AddToAlbum zIndex={1000000} open={open} setOpen={setOpen} albums={props.albums} cb={cb} closeCallback={props.closeAddSnackbar} />
        </div>
    );
}

export class AddPhotosSnackbar {
    enqueueSnackbar: (message: React.ReactNode, options?: OptionsObject | undefined) => string | number;
    closeSnackbar: (key?: string | number | undefined) => void;
    albums?: AlbumT[]
    snackMsg: string | number | undefined;

    constructor(
        enqueueSnackbar: (message: React.ReactNode, options?: OptionsObject | undefined) => string | number,
        closeSnackbar: (key?: string | number | undefined) => void,
        albums?: AlbumT[]
    ) {
        this.enqueueSnackbar = enqueueSnackbar;
        this.closeSnackbar = closeSnackbar;
        this.albums = albums;
    }

    static createInstance(
        enqueueSnackbar?: (message: React.ReactNode, options?: OptionsObject | undefined) => string | number,
        closeSnackbar?: (key?: string | number | undefined) => void,
        albums?: AlbumT[]
    ): null | AddPhotosSnackbar {
        if (enqueueSnackbar && closeSnackbar) return new this(enqueueSnackbar, closeSnackbar, albums);
        else return null;
    }

    begin(amount: number) {
        const message = `${amount} element${amount === 1 ? " is" : "s are"} being uploaded`;
        const action = SnackbarAction(null, <CircularProgress color="inherit" style={{ padding: 5 }} />);
        this.snackMsg = this.enqueueSnackbar!(message, {
            variant: "info",
            autoHideDuration: null,
            action,
        });
    }

    end(photos: string[], errors: string[]) {
        if (this.snackMsg) this.closeSnackbar(this.snackMsg);
        const message = `${photos.length} element${photos.length === 1 ? " was" : "s were"} uploaded`;
        const action = SnackbarAction(
            this.closeSnackbar,
            this.albums ?
                (key: any) => <DialogComponent photos={photos} closeSnackbar={this.closeSnackbar} closeAddSnackbar={() => { if (key) this.closeSnackbar(key) }} enqueueSnackbar={this.enqueueSnackbar} albums={this.albums} /> : null
        );
        let count = 0;
        const errorMessage = (
            <div>
                The following errors occured:
                {errors.map((e) => (
                    <div key={count++}>{e.toString()}</div>
                ))}
            </div>
        );
        const errorAction = SnackbarAction(this.closeSnackbar);

        if (photos.length !== 0)
            this.enqueueSnackbar(message, {
                variant: "success",
                autoHideDuration: 3000,
                action,
            });

        if (errors.length !== 0)
            this.enqueueSnackbar(errorMessage, {
                variant: "error",
                autoHideDuration: null,
                action: errorAction,
            });
    }
}
