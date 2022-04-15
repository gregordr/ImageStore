import { useEffect, useState } from "react";
import Button from "@material-ui/core/Button";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogTitle from "@material-ui/core/DialogTitle";
import useMediaQuery from "@material-ui/core/useMediaQuery";
import { useTheme } from "@material-ui/core/styles";
import { ListItem, ListItemText, CircularProgress, List, Avatar, ListItemAvatar } from "@material-ui/core";
import { AlbumT, PhotoT } from "../../Interfaces";
import { baseURL, getAlbumsWithMedia } from "../../API";
import { PhotoAlbum } from "@material-ui/icons";

export default function OpenInDialog(props: { cb: (album: "default" | string) => void; setOpen: (arg0: boolean) => void; open: boolean; photo?: PhotoT }) {
    const theme = useTheme();
    const fullScreen = useMediaQuery(theme.breakpoints.down("sm"));
    const [albums, setAlbums] = useState<"loading" | AlbumT[]>("loading");

    useEffect(() => {
        setAlbums("loading")
        if (props.photo)
            (async () => setAlbums((await getAlbumsWithMedia(props.photo!.id)).data))()
    }, [props.photo]);

    //refresh
    useEffect(() => {
        if (props.photo && props.open)
            (async () => setAlbums((await getAlbumsWithMedia(props.photo!.id)).data))()
    }, [props.open]);

    const handleClose = (execute: boolean, album: "default" | string) => async () => {
        if (execute) props.cb(album);
        props.setOpen(false);
    };

    return (
        <Dialog
            onKeyPress={(ev) => {
                if (ev.key === "Enter") {
                    handleClose(false, "")();
                    ev.preventDefault();
                }
            }}
            fullScreen={fullScreen}
            open={props.open}
            onClose={handleClose(false, "")}
            style={{ zIndex: 1000000 }}
            aria-labelledby="responsive-dialog-title"
        >
            <DialogTitle id="responsive-dialog-title">Open in Album</DialogTitle>
            <DialogContent style={{ height: fullScreen ? "100%" : "600px", width: fullScreen ? "100%" : "600px", alignItems: "center", padding: 0 }}>
                <div style={{ height: "100%", width: "100%" }}>

                    <List >
                        {albums === "loading" ? <CircularProgress color="inherit" style={{ padding: 5 }} /> :
                            [{ name: "All photos", id: "default", cover: null, imagecount: 0 }, ...albums].map((album) => {
                                return (
                                    <ListItem button onClick={handleClose(true, album.id)}>
                                        <ListItemAvatar>
                                            <Avatar>
                                                {album.cover ?
                                                    <div
                                                        style={{
                                                            backgroundImage: `url(${baseURL + "/media/thumb_" + album.cover})`,
                                                            backgroundSize: "cover",
                                                            width: "100%",
                                                            height: "100%",
                                                        }}
                                                    />
                                                    :
                                                    <PhotoAlbum />
                                                }
                                            </Avatar>
                                        </ListItemAvatar>
                                        <ListItemText primary={album.name} secondary={album.imagecount ? `${album.imagecount} elements` : ""} />
                                    </ListItem>
                                )
                            })
                        }
                    </List>

                </div>
            </DialogContent>
            <DialogActions>
                <Button onClick={handleClose(false, "")} color="primary">
                    Cancel
                </Button>
            </DialogActions>
        </Dialog>
    );
}
