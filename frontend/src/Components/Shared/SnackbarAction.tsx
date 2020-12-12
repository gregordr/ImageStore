import { ReactNode } from "react";
import { IconButton } from "@material-ui/core";
import { Close } from "@material-ui/icons";

export default function SnackbarAction(closeSnackbar: (key: any) => void, actions: ReactNode = null) {

    const action = (key: any) => (
        <>
            {actions}
            <IconButton
                size="small"
                color="inherit"
                onClick={() => closeSnackbar(key)}
            >
                <Close fontSize="small" />
            </IconButton>
        </>
    )

    return action;
}