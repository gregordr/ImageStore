import React, { useEffect, useState } from "react";
import Button from "@material-ui/core/Button";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogTitle from "@material-ui/core/DialogTitle";
import useMediaQuery from "@material-ui/core/useMediaQuery";
import { useTheme } from "@material-ui/core/styles";
import { TextField } from "@material-ui/core";
import { AlbumT } from "../../Interfaces";
import { clearCover, deleteAlbum, renameAlbum } from "../../API";
import ConfirmDeleteDialog from "../Shared/ConfirmDeleteDialog";
import AutoAddDialog from "./AutoAddDialog";

export default function AlbumInfo(props: { album: AlbumT; open: boolean; setOpen: (arg0: boolean) => any; fetchAlbums: () => Promise<void> }) {
    const theme = useTheme();
    const fullScreen = useMediaQuery(theme.breakpoints.down("sm"));
    const [nameField, setNameField] = useState(props.album.name);
    const [hasCover, setHasCover] = useState(props.album.cover !== null);

    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [onDeleteDialogClose, setOnDeleteDialogClose] = useState<(confirm: boolean) => () => void>(() => (confirm: boolean) => () => {
        setDeleteDialogOpen(false);
        alert("Error onDeleteClose not defined");
    });

    const [autoAddDialogOpen, setAutoAddDialogOpen] = useState(false);

    useEffect(() => {
        if (props.open) {
            setNameField(props.album.name);
            setHasCover(props.album.cover !== null);
        }
    }, [props.open]);

    const handleClose = (execute: boolean) => async () => {
        let ex = false;
        if (execute && props.album.name !== nameField) {
            ex = true;
            await renameAlbum(props.album.id, nameField);
        }
        if (execute && props.album.cover !== null && !hasCover) {
            ex = true;
            await clearCover(props.album.id);
        }

        if (ex) await props.fetchAlbums();

        await props.setOpen(false);
    };

    const deleteThis = async () => {
        setOnDeleteDialogClose(() => (confirm: boolean) => async () => {
            if (confirm) {
                await deleteAlbum(props.album.id);
                await props.fetchAlbums();
                await handleClose(false)();
            }

            setDeleteDialogOpen(false);
        });
        setDeleteDialogOpen(true);
    };

    return (
        <div>
            <Dialog fullScreen={fullScreen} open={props.open} onClose={handleClose(false)} aria-labelledby="responsive-dialog-title">
                <DialogTitle id="responsive-dialog-title">Settings of {props.album.name}</DialogTitle>
                <DialogContent>
                    <Button style={{ backgroundColor: "#dddddd" }} onClick={() => setAutoAddDialogOpen(true)}>
                        Auto-adding
                    </Button>
                    <br></br>
                    <br></br>
                    <Button style={{ backgroundColor: "#dddddd" }} disabled={!hasCover} onClick={() => setHasCover(false)}>
                        {hasCover ? "Clear cover" : "No album cover"}
                    </Button>
                    <br></br>
                    <br></br>
                    <TextField
                        value={nameField}
                        onChange={(e) => setNameField(e.target.value)}
                        inputProps={{ style: { fontSize: 20 } }} // font size of input text
                        InputLabelProps={{ style: { fontSize: 20 } }} // font size of input label
                    ></TextField>
                </DialogContent>
                <DialogActions>
                    <Button onClick={deleteThis} color="primary" autoFocus>
                        Delete Album
                    </Button>
                    <Button onClick={handleClose(false)} color="primary" autoFocus>
                        Cancel
                    </Button>
                    <Button onClick={handleClose(true)} color="primary" autoFocus>
                        Save
                    </Button>
                </DialogActions>
            </Dialog>
            <ConfirmDeleteDialog open={deleteDialogOpen} handleClose={onDeleteDialogClose}></ConfirmDeleteDialog>
            <AutoAddDialog open={autoAddDialogOpen} setOpen={setAutoAddDialogOpen} albumId={props.album.id} fetchAlbums={props.fetchAlbums}></AutoAddDialog>
        </div>
    );
}
