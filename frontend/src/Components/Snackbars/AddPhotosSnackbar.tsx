import { Button, CircularProgress } from "@material-ui/core";
import { OptionsObject } from "notistack";
import React from "react";
import SnackbarAction from "./SnackbarAction";

export class AddPhotosSnackbar {
    enqueueSnackbar: (message: React.ReactNode, options?: OptionsObject | undefined) => string | number;
    closeSnackbar: (key?: string | number | undefined) => void;
    toAlbum?: (photos: string[]) => void;
    snackMsg: string | number | undefined;

    constructor(
        enqueueSnackbar: (message: React.ReactNode, options?: OptionsObject | undefined) => string | number,
        closeSnackbar: (key?: string | number | undefined) => void,
        toAlbum?: (photos: string[]) => void
    ) {
        this.enqueueSnackbar = enqueueSnackbar;
        this.closeSnackbar = closeSnackbar;
        this.toAlbum = toAlbum;
    }

    static createInstance(
        enqueueSnackbar?: (message: React.ReactNode, options?: OptionsObject | undefined) => string | number,
        closeSnackbar?: (key?: string | number | undefined) => void,
        toAlbum?: (photos: string[]) => void
    ): null | AddPhotosSnackbar {
        if (enqueueSnackbar && closeSnackbar) return new this(enqueueSnackbar, closeSnackbar, toAlbum);
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
            <Button color="inherit" onClick={() => this.toAlbum?.(photos)}>
                Add to album
            </Button>
        );
        const errorMessage = (
            <div>
                The following errors occured:
                {errors.map((e) => (
                    <div>{e}</div>
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
