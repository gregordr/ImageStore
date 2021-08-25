import React, { useEffect, useState } from "react";
import Button from "@material-ui/core/Button";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogTitle from "@material-ui/core/DialogTitle";
import useMediaQuery from "@material-ui/core/useMediaQuery";
import { makeStyles, useTheme } from "@material-ui/core/styles";
import { ListItem, ListItemText, Checkbox, TextField } from "@material-ui/core";
import { AlbumT, PhotoT } from "../../Interfaces";
import CreateAlbum from "../AlbumPage/CreateAlbum";
import { createAlbum } from "../../API";
import moment from "moment";
import { isConstructorDeclaration } from "typescript";
import isValid from "is-valid-path";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";

const useStyles = makeStyles({
    root: {
        "&:hover": {
            backgroundColor: "transparent",
        },
    },
});

export default function EditLocationDialog(props: { cb: (x?: number, y?: number) => any; setOpen: (arg0: boolean) => any; open: boolean; photo?: PhotoT }) {
    const theme = useTheme();
    const fullScreen = useMediaQuery(theme.breakpoints.down("sm"));
    const [x, setX] = useState<undefined | number>();
    const [y, setY] = useState<undefined | number>();

    useEffect(() => {
        setX(props.photo?.coordx);
        setY(props.photo?.coordy);
    }, [props.photo]);

    const handleClose = (execute: boolean) => async () => {
        if (execute) await props.cb(x, y);
        setX(props.photo?.coordx);
        setY(props.photo?.coordy);
        await props.setOpen(false);
    };

    function MapClick() {
        useMapEvents({
            click(e) {
                setY(e.latlng.lng);
                setX(e.latlng.lat);
            },
        });
        return null;
    }

    return (
        <Dialog
            onKeyPress={(ev) => {
                if (ev.key === "Enter") {
                    handleClose(true)();
                    ev.preventDefault();
                }
            }}
            fullScreen={fullScreen}
            open={props.open}
            onClose={handleClose(false)}
            style={{ zIndex: 1000000 }}
            aria-labelledby="responsive-dialog-title"
        >
            <DialogTitle id="responsive-dialog-title">Set location</DialogTitle>
            <DialogContent style={{ height: fullScreen ? "100%" : "600px", width: fullScreen ? "100%" : "600px", alignItems: "center" }}>
                <div style={{ height: fullScreen ? "100%" : "550px", width: fullScreen ? "100%" : "550px" }}>
                    <MapContainer scrollWheelZoom={true} attributionControl={false} center={[x ?? 0, y ?? 0]} zoom={x && y ? 13 : 1} style={{ height: "100%", width: "100%" }} key={props.photo?.id}>
                        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                        {x && y && <Marker position={[x, y]}></Marker>}
                        <MapClick></MapClick>
                    </MapContainer>
                </div>
            </DialogContent>
            <DialogActions>
                <Button
                    onClick={() => {
                        setX(undefined);
                        setY(undefined);
                    }}
                    color="primary"
                >
                    Clear
                </Button>
                <Button onClick={handleClose(false)} color="primary">
                    Cancel
                </Button>
                <Button onClick={handleClose(true)} color="primary" autoFocus>
                    Ok
                </Button>
            </DialogActions>
        </Dialog>
    );
}
