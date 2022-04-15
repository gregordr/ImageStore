import React from "react";
import Button from "@material-ui/core/Button";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogContentText from "@material-ui/core/DialogContentText";
import DialogTitle from "@material-ui/core/DialogTitle";

export default function ConfirmDeleteDialog(props: { state: { open: boolean, handleClose: (confirm: boolean) => () => void } }) {
    return (
        <div>
            <Dialog open={props.state.open} onClose={props.state.handleClose(false)} aria-labelledby="alert-dialog-title" aria-describedby="alert-dialog-description">
                <DialogTitle id="alert-dialog-title">{"Deleting is permament. Are you sure?"}</DialogTitle>
                <DialogActions>
                    <Button onClick={props.state.handleClose(false)} color="primary">
                        Cancel
                    </Button>
                    <Button onClick={props.state.handleClose(true)} color="primary" autoFocus>
                        Confirm
                    </Button>
                </DialogActions>
            </Dialog>
        </div>
    );
}
