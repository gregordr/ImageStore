import React, { useEffect, useState } from "react";
import Button from "@material-ui/core/Button";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogTitle from "@material-ui/core/DialogTitle";
import useMediaQuery from "@material-ui/core/useMediaQuery";
import { createStyles, makeStyles, Theme, useTheme } from "@material-ui/core/styles";
import { ListItem, ListItemText, Checkbox, Chip, TextField, CircularProgress } from "@material-ui/core";
import { AlbumT } from "../../Interfaces";
import CreateAlbum from "../AlbumPage/CreateAlbum";
import { createAlbum } from "../../API";
import { AddCircle } from "@material-ui/icons";

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        root: {
            "&:hover": {
                backgroundColor: "transparent",
            },
        },
        chip: {
            margin: theme.spacing(0.5),
        },
    })
);

function LabelChip(props: any) {
    const classes = useStyles(useTheme());
    const [deleted, setDeleted] = useState(false);

    return (
        <Chip
            label={props.label}
            onDelete={async () => {
                setDeleted(true);
                props.removeLabel(props.label);
            }}
            className={classes.chip}
            deleteIcon={deleted ? <CircularProgress style={{ height: 20, width: 20, padding: 1.5, marginRight: 7 }} /> : undefined}
        />
    );
}

function LabelInputChip(props: any) {
    const classes = useStyles(useTheme());
    const [value, setValue] = useState("");
    const [added, setAdded] = useState(false);

    const handleAdd = async () => {
        setAdded(true);
        props.addLabel(value);
        setValue("");
        setAdded(false);
    };

    return (
        <Chip
            style={{ width: 120 }}
            label={
                <TextField
                    style={{ height: 25, marginBottom: 5, marginLeft: 5 }}
                    value={value}
                    onChange={(event) => setValue(event.target.value)}
                    onKeyPress={(ev) => {
                        if (ev.key === "Enter") {
                            handleAdd();
                            ev.preventDefault();
                        }
                    }}
                />
            }
            onDelete={handleAdd}
            className={classes.chip}
            deleteIcon={added ? <CircularProgress style={{ height: 20, width: 20, padding: 1.5, marginRight: 7 }} /> : <AddCircle style={{ transform: "rotate(0deg)" }} />}
        />
    );
}

export default function AddToAlbum(props: { cb: (arg0: string[]) => any; setOpen: (arg0: boolean) => any; open: boolean; closeCallback?: () => void }) {
    const [labels, setLabels] = useState<string[]>([]);
    const theme = useTheme();
    const fullScreen = useMediaQuery(theme.breakpoints.down("sm"));

    const handleClose = (execute: boolean) => async () => {
        if (execute && labels.length > 0) await props.cb(labels);
        setLabels([]);
        await props.setOpen(false);
        props.closeCallback?.();
    };

    return (
        <div>
            <Dialog fullScreen={fullScreen} open={props.open} onClose={handleClose(false)} style={{ zIndex: 1000000 }} aria-labelledby="responsive-dialog-title">
                <DialogTitle id="responsive-dialog-title">Add labels</DialogTitle>
                <DialogContent>
                    <ul
                        style={{
                            display: "flex",
                            justifyContent: "left",
                            flexWrap: "wrap",
                            listStyle: "none",
                            padding: 0,
                            margin: 0,
                            marginLeft: 5,
                            marginTop: -10,
                        }}
                    >
                        {labels.map((label) => {
                            return (
                                <li key={label}>
                                    <LabelChip label={label} removeLabel={(remove: string) => setLabels(labels.filter((l: string) => l !== remove))} />
                                </li>
                            );
                        })}
                    </ul>
                    <LabelInputChip
                        addLabel={(label: string) => {
                            if (!labels.includes(label)) setLabels(labels.concat(label));
                        }}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose(false)} color="primary">
                        Cancel
                    </Button>
                    <Button onClick={handleClose(true)} color="primary" autoFocus>
                        Confirm
                    </Button>
                </DialogActions>
            </Dialog>
        </div>
    );
}
