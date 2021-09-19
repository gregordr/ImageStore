import React, { useEffect, useState } from "react";
import Button from "@material-ui/core/Button";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogContentText from "@material-ui/core/DialogContentText";
import DialogTitle from "@material-ui/core/DialogTitle";
import { CircularProgress, FormControlLabel, IconButton, List, ListItem, ListItemAvatar, ListItemSecondaryAction, ListItemText, Switch, TextField } from "@material-ui/core";
import DeleteIcon from '@material-ui/icons/Delete';
import { addAutoAddLabel, getAutoAddLabels, removeAutoAddLabel } from "../../API";

export default function AutoAddDialog(props: { open: boolean; setOpen: (open: boolean) => void, albumId: string, fetchAlbums: () => Promise<void> }) {

    const [labels, setLabels] = useState<string[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [labelInput, setLabelInput] = useState("")
    const [addExisting, setAddExisting] = useState(false)

    useEffect(() => {
        if (props.open) {
            fetch()
        }
        else {
            setIsLoading(true)
        }
    }, [props.open])

    const fetch = async () => {
        setLabels((await getAutoAddLabels(props.albumId)).data)
        setIsLoading(false)
    }

    const add = async (newLabel: string, addExisting: boolean) => {
        if (isLoading || labels.includes(newLabel))
            return;

        setIsLoading(true)

        await addAutoAddLabel(props.albumId, newLabel, addExisting)
        if (addExisting) {
            await props.fetchAlbums()
        }
        setLabelInput("")
        await fetch()
    }

    const remove = async (removeLabel: string) => {
        setIsLoading(true)
        await removeAutoAddLabel(props.albumId, removeLabel)
        await fetch()
    }

    return (
        <div>
            <Dialog open={props.open} onClose={() => props.setOpen(false)} aria-labelledby="alert-dialog-title" aria-describedby="alert-dialog-description">
                <DialogTitle id="alert-dialog-title">{"Auto-add to album"}</DialogTitle>
                <DialogContent>
                    Add photos which get labeled with the following labels to this album automatically:
                    <>
                        <List dense>
                            {labels.map((label) => {
                                return <ListItem key={label} style={{ height: 36 }}>
                                    <ListItemText
                                        primary={label}
                                    />
                                    <ListItemSecondaryAction>
                                        <IconButton edge="end" aria-label="delete" onClick={() => remove(label)}>
                                            <DeleteIcon />
                                        </IconButton>
                                    </ListItemSecondaryAction>
                                </ListItem>
                            })}
                        </List>

                        {isLoading && <CircularProgress />}
                        <div style={{ textAlign: "center", background: "#eeeeee", borderRadius: "5px" }}>
                            <TextField
                                id="standard-basic"
                                label="Label"
                                variant="standard"
                                value={labelInput}
                                style={{ margin: 10 }}
                                onChange={(e) => setLabelInput(e.target.value)} onKeyPress={(ev) => {
                                    if (ev.key === 'Enter') {
                                        add(labelInput, addExisting)
                                        ev.preventDefault();
                                    }
                                }}
                                error={labels.includes(labelInput)}
                                helperText={labels.includes(labelInput) ? "Label already included" : ""}
                            />
                            <FormControlLabel
                                style={{ margin: 10 }}
                                control={<Switch color="primary" size="small" value={addExisting} onChange={(e) => setAddExisting(e.target.checked)} />}
                                label="Add existing"
                                labelPlacement="bottom"
                            />
                            <Button style={{ background: "#ddd", margin: 10 }} onClick={() => add(labelInput, addExisting)}>Add</Button>
                        </div>
                    </>

                </DialogContent>
                <DialogActions>
                    <Button onClick={() => props.setOpen(false)} color="primary" autoFocus>
                        Done
                    </Button>
                </DialogActions>
            </Dialog>
        </div>
    );
}