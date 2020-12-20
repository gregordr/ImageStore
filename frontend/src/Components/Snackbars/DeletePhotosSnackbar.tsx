import { CircularProgress } from "@material-ui/core";
import { OptionsObject } from "notistack";
import React from "react";
import SnackbarAction from "./SnackbarAction";

export class DeletePhotosSnackbar {
    enqueueSnackbar: (message: React.ReactNode, options?: OptionsObject | undefined) => string | number;
    closeSnackbar: (key?: string | number | undefined) => void;
    snackMsg: string | number | undefined;
    test: string;

    constructor(enqueueSnackbar: (message: React.ReactNode, options?: OptionsObject | undefined) => string | number, closeSnackbar: (key?: string | number | undefined) => void, test?: string) {
        this.enqueueSnackbar = enqueueSnackbar;
        this.closeSnackbar = closeSnackbar;
        this.test = test!;
    }

    static createInstance(
        enqueueSnackbar?: (message: React.ReactNode, options?: OptionsObject | undefined) => string | number,
        closeSnackbar?: (key?: string | number | undefined) => void
    ): null | DeletePhotosSnackbar {
        if (enqueueSnackbar && closeSnackbar) return new this(enqueueSnackbar, closeSnackbar);
        else return null;
    }

    begin(amount: number) {
        const message = `${amount} element${amount === 1 ? " is" : "s are"} being deleted`;
        const action = SnackbarAction(null, <CircularProgress color="inherit" style={{ padding: 5 }} />);
        this.snackMsg = this.enqueueSnackbar!(message, {
            variant: "info",
            autoHideDuration: null,
            action,
        });
    }

    end(photos: any[], errors: string[]) {
        if (this.snackMsg) this.closeSnackbar(this.snackMsg);
        const message = `${photos.length} element${photos.length === 1 ? " was" : "s were"} deleted`;
        const action = SnackbarAction(this.closeSnackbar);
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