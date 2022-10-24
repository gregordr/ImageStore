import React, { useEffect, useState } from "react";
import Button from "@material-ui/core/Button";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogTitle from "@material-ui/core/DialogTitle";
import useMediaQuery from "@material-ui/core/useMediaQuery";
import { useTheme } from "@material-ui/core/styles";
import { TextField } from "@material-ui/core";
import { AlbumT, FolderT } from "../../Interfaces";
import { clearCover, deleteAlbum, renameAlbum } from "../../API";
import ConfirmDeleteDialog from "../Shared/ConfirmDeleteDialog";
import AutoAddDialog from "./AutoAddDialog";
import ChangeLocationDialog from "./ChangeLocationDialog";
import { useFoldersQuery, useMoveAlbumMutation } from "../../Queries/AlbumQueries";

export default function AlbumInfo(props: { album: AlbumT; open: boolean; setOpen: (arg0: boolean) => any; fetchAlbums: () => Promise<void>; currentFolder?: FolderT }) {
    const theme = useTheme();
    const fullScreen = useMediaQuery(theme.breakpoints.down("sm"));
    const [nameField, setNameField] = useState(props.album.name);
    const [hasCover, setHasCover] = useState(props.album.cover !== null);

    const [onDeleteDialogState, setOnDeleteDialogState] = useState<{ open: boolean, handleClose: (confirm: boolean) => () => void }>({ open: false, handleClose: () => () => { } });

    const [autoAddDialogOpen, setAutoAddDialogOpen] = useState(false);

    const query = useFoldersQuery([]);
    const putAlbumIntoFolderMutation = useMoveAlbumMutation()
    const currentFolderId = props.currentFolder?.id ?? "";

    const [changeLocationDialogOpen, setChangeLocationDialogOpen] = useState(false)
    const [selectedFolderId, setSelectedFolderId] = useState(currentFolderId)

    useEffect(() => {
        if (props.open) {
            setNameField(props.album.name);
            setHasCover(props.album.cover !== null);
            setSelectedFolderId(currentFolderId)
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
        if (execute && currentFolderId !== selectedFolderId) {
            ex = true;
            await putAlbumIntoFolderMutation.mutateAsync({ oid: props.album.id, parentOid: selectedFolderId || undefined });
        }

        if (ex) await props.fetchAlbums();

        await props.setOpen(false);
    };

    const deleteThis = async () => {
        setOnDeleteDialogState({
            open: true,
            handleClose: (confirm: boolean) => async () => {
                if (confirm) {
                    await deleteAlbum(props.album.id);
                    await props.fetchAlbums();
                    await handleClose(false)();
                }

                setOnDeleteDialogState({ open: false, handleClose: () => () => { } });
            }
        });
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
                    <br></br>
                    <br></br>
                    <Button style={{ backgroundColor: "#dddddd" }} onClick={() => setChangeLocationDialogOpen(true)}>
                        Move from {query.data?.idMap[selectedFolderId]?.name ?? "Root"}
                    </Button>
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
            <ConfirmDeleteDialog state={onDeleteDialogState}></ConfirmDeleteDialog>
            <AutoAddDialog open={autoAddDialogOpen} setOpen={setAutoAddDialogOpen} albumId={props.album.id} fetchAlbums={props.fetchAlbums}></AutoAddDialog>
            <ChangeLocationDialog currentFolderId={currentFolderId} open={changeLocationDialogOpen} onSelected={(id) => { setSelectedFolderId(id); setChangeLocationDialogOpen(false) }}></ChangeLocationDialog>
        </div>
    );
}
