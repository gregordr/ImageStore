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
import { useDeleteFolderMutation, useFoldersQuery, useMoveFolderMutation, useRenameFolderMutation } from "../../Queries/AlbumQueries";
import { TreeItem, TreeView } from "@material-ui/lab";
import { ExpandMore, ChevronRight } from "@material-ui/icons";
import ChangeLocationDialog from "./ChangeLocationDialog";

export default function FolderInfo(props: { folder: FolderT; open: boolean; setOpen: (arg0: boolean) => any; currentFolder?: FolderT }) {
    const theme = useTheme();
    const fullScreen = useMediaQuery(theme.breakpoints.down("sm"));
    const [nameField, setNameField] = useState(props.folder.name);
    const [hasCover, setHasCover] = useState(props.folder.cover !== null);

    const [onDeleteDialogState, setOnDeleteDialogState] = useState<{ open: boolean, handleClose: (confirm: boolean) => () => void }>({ open: false, handleClose: () => () => { } });

    const query = useFoldersQuery([], props.folder.id);
    const putFolderIntoFolderMutation = useMoveFolderMutation()
    const currentFolderId = props.currentFolder?.id ?? "";

    const [changeLocationDialogOpen, setChangeLocationDialogOpen] = useState(false)
    const [selectedFolderId, setSelectedFolderId] = useState(currentFolderId)

    const deleteFolderMutation = useDeleteFolderMutation()
    const renameFolderMutation = useRenameFolderMutation()

    useEffect(() => {
        if (props.open) {
            setNameField(props.folder.name);
            setHasCover(props.folder.cover !== null);
            setSelectedFolderId(currentFolderId)
        }
    }, [props.open]);

    const handleClose = (execute: boolean) => async () => {
        if (execute && props.folder.name !== nameField) {
            await renameFolderMutation.mutateAsync({ oid: props.folder.id, newName: nameField });
        }
        if (execute && currentFolderId !== selectedFolderId) {
            await putFolderIntoFolderMutation.mutateAsync({ oid: props.folder.id, parentOid: selectedFolderId || undefined });
        }
        await props.setOpen(false);
    };

    const deleteThis = async () => {
        setOnDeleteDialogState({
            open: true,
            handleClose: (confirm: boolean) => async () => {
                if (confirm) {
                    await deleteFolderMutation.mutateAsync({ oid: props.folder.id });
                    await handleClose(false)();
                }

                setOnDeleteDialogState({ open: false, handleClose: () => () => { } });
            }
        });
    };

    return (
        <div>
            <Dialog fullScreen={fullScreen} open={props.open} onClose={handleClose(false)} aria-labelledby="responsive-dialog-title">
                <DialogTitle id="responsive-dialog-title">Settings of {props.folder.name}</DialogTitle>
                <DialogContent>
                    {/* <body style={{ fontSize: "30px" }}> {query.data?.idMap[selectedFolderId]?.name}</body> */}

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
                        Delete Folder
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
            <ChangeLocationDialog currentFolderId={currentFolderId} hideFolderId={props.folder.id} open={changeLocationDialogOpen} onSelected={(id) => { setSelectedFolderId(id); setChangeLocationDialogOpen(false) }}></ChangeLocationDialog>
        </div>
    );
}
