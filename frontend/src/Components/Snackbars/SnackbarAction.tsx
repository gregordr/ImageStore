import { ReactNode } from "react";
import { IconButton } from "@material-ui/core";
import { Close } from "@material-ui/icons";

export default function SnackbarAction(closeSnackbar: null | ((key: any) => void), actions: ((key: any) => ReactNode) | ReactNode = null) {
    const action = (key: any) => (
        <>
            {actions && actions instanceof Function ? actions(key) : actions}
            {closeSnackbar && (
                <IconButton
                    size="small"
                    color="inherit"
                    onClick={() => {
                        closeSnackbar(key);
                    }}
                >
                    <Close fontSize="small" />
                </IconButton>
            )}
        </>
    );

    return action;
}
