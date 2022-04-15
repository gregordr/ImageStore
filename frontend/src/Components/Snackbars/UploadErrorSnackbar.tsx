import { OptionsObject } from "notistack";
import React from "react";
import { FileRejection } from "react-dropzone";
import SnackbarAction from "./SnackbarAction";

export class UploadErrorSnackbar {
    enqueueSnackbar: (message: React.ReactNode, options?: OptionsObject | undefined) => string | number;
    closeSnackbar: (key?: string | number | undefined) => void;
    snackMsg: string | number | undefined;

    constructor(enqueueSnackbar: (message: React.ReactNode, options?: OptionsObject | undefined) => string | number, closeSnackbar: (key?: string | number | undefined) => void) {
        this.enqueueSnackbar = enqueueSnackbar;
        this.closeSnackbar = closeSnackbar;
    }

    static createInstance(
        enqueueSnackbar?: (message: React.ReactNode, options?: OptionsObject | undefined) => string | number,
        closeSnackbar?: (key?: string | number | undefined) => void
    ): null | UploadErrorSnackbar {
        if (enqueueSnackbar && closeSnackbar) return new this(enqueueSnackbar, closeSnackbar);
        else return null;
    }

    begin(fileRejections: FileRejection[]) {
        let count = 0;
        const errorMessage = (
            <div>
                The following errors occured:
                {fileRejections.map((fileRejection) => (
                    <div key={count++}>{`${fileRejection.file.name}: ${fileRejection.errors[0].message}`}</div>
                ))}
            </div>
        );
        const errorAction = SnackbarAction(this.closeSnackbar);
        if (fileRejections.length !== 0)
            this.enqueueSnackbar(errorMessage, {
                variant: "error",
                autoHideDuration: null,
                action: errorAction,
            });
    }
}
