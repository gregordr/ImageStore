import React, { RefObject, useEffect, useState } from "react";
import "./PhotoPage.css";
import { makeStyles } from "@material-ui/core/styles";
import MenuIcon from "@material-ui/icons/Menu";
import { CssBaseline, AppBar, Toolbar, IconButton, createStyles, Theme } from "@material-ui/core";
import TopBar from "./TopBar";
import { Route, Switch, useHistory } from "react-router-dom";
import ViewPage from "../../ViewPage/ViewPage";
import axios from "axios";
import AddToAlbum from "../../PhotoPage/AddToAlbum";
import qs from "qs";
import { PhotoT, AlbumT } from "../../../Interfaces";
import AbstractPhotoPage from "../../Shared/PhotoPage";

const drawerWidth = 240;
const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        root: {
            display: "flex",
        },
        drawer: {
            [theme.breakpoints.up("sm")]: {
                width: drawerWidth,
                flexShrink: 0,
            },
        },
        appBar: {
            background: "white",
            [theme.breakpoints.up("sm")]: {
                width: `calc(100% - ${drawerWidth}px)`,
                marginLeft: drawerWidth,
            },
        },
        menuButton: {
            color: theme.palette.primary.main,
            marginRight: theme.spacing(2),
            [theme.breakpoints.up("sm")]: {
                display: "none",
            },
        },
        // necessary for content to be below app bar
        toolbar: theme.mixins.toolbar,
        drawerPaper: {
            width: drawerWidth,
        },
        topleft: {
            color: "#666666",
            fontSize: "xx-large",
            display: "flex",
            "justify-content": "center",
            "align-items": "center",
            height: 64,
        },
        content: {
            flexGrow: 1,
            padding: theme.spacing(3),
        },
    })
);

export default function AlbumPhotoPage(props: { handleDrawerToggle: () => void; drawerElement: any; refresh: () => Promise<void> }) {
    const classes = useStyles();
    const hiddenFileInput: RefObject<HTMLInputElement> = React.useRef(null);

    const history = useHistory();
    const [id, setId] = useState(window.location.pathname.split("/").slice(-1)[0]);

    const [photos, setPhotos] = useState<PhotoT[]>([]);
    const [albums, setAlbums] = useState<AlbumT[]>([]);
    const [selected, setSelected] = useState<string[]>([]);
    const [selectable, setSelectable] = useState(false);
    const [open, setOpen] = useState(false);

    const fetchPhotos = async () => {
        const resp = await axios.get(`albums/${id}/all`);
        if (resp.status === 200) {
            setPhotos(resp.data);
        } else {
            window.alert(await resp.data);
        }
    };

    const fetchAlbums = async () => {
        const resp = await axios.get("albums/all");
        if (resp.status === 200) {
            setAlbums(resp.data);
        } else {
            window.alert(await resp.data);
        }
    };

    useEffect(() => {
        fetchPhotos();
        fetchAlbums();
    }, []);

    const imageClickHandler = (id: string) => () => {
        if (anySelected()) {
            clickHandler(id)();
        } else {
            history.push(`/view/${id}`);
        }
    };

    const clickHandler = (id: string) => () => {
        let copy = selected.slice();
        if (copy.includes(id)) copy = copy.filter((v) => v !== id);
        else copy.push(id);
        setSelected(copy);
        if (copy.length === 0) {
            setSelectable(false);
        }
    };

    const anySelected = (): boolean => {
        return selected.length !== 0 || selectable;
    };

    const cb = async (albumIds: any) => {
        const requestBody = {
            photos: selected,
            albums: albumIds,
        };

        await axios.post("/albums/addPhotos", qs.stringify(requestBody));
        topBarButtonFunctions.unselect();
    };

    const viewButtonFunctions = {
        delete: async (id: string) => {
            await deletePhoto(id);
            await fetchPhotos();
        },
        addToAlbum: (id: string) => {
            setSelected([id]);
            setOpen(true);
        },
    };

    const deletePhoto = async (pid: any) => {
        try {
            await axios.post("/media/delete/" + pid);
            await props.refresh();
        } catch (error: any) {
            if (error.response) {
                window.alert(error.response.data);
            }
            console.log(error);
        }
    };

    const removePhoto = async (pid: any) => {
        try {
            await axios.post(`/albums/remove/${id}/${pid}`);
            await props.refresh();
        } catch (error: any) {
            if (error.response) {
                window.alert(error.response.data);
            }
            console.log(error);
        }
    };

    const topBarButtonFunctions = {
        delete: async () => {
            await Promise.all(
                photos.map(async (p) => {
                    if (selected.includes(p.id)) {
                        return await deletePhoto(p.id);
                    }
                })
            );

            topBarButtonFunctions.unselect();
            await fetchPhotos();
        },
        remove: async () => {
            await Promise.all(
                photos.map(async (p) => {
                    if (selected.includes(p.id)) {
                        return await removePhoto(p.id);
                    }
                })
            );

            topBarButtonFunctions.unselect();
            await fetchPhotos();
        },
        unselect: () => {
            setSelected([]);
            setSelectable(false);
        },
        upload: () => {
            if (hiddenFileInput === null) {
                console.log("hiddenFileInput is null");
            } else {
                const refas: any = hiddenFileInput.current!;
                refas.click();
            }
        },
        settings: () => {
            //Nav to settings page
        },
        select: () => {
            setSelectable(true);
        },
        addToAlbum: () => {
            setOpen(true);
        },
    };

    const upload = async (event: any) => {
        const fileUploaded: any = [...event.target.files];
        try {
            const formData = new FormData();
            fileUploaded.map((f: any) => {
                formData.append("file", f);
            });
            const res = await axios.post("/media/add", formData);
            console.log(res);
            await fetchPhotos();
        } catch (error: any) {
            if (error.response) {
                window.alert(error.response.data);
            }
        }
    };

    return (
        <div>
            <Switch>
                <Route path="/view">
                    <ViewPage photos={photos} buttonFunctions={viewButtonFunctions}></ViewPage>
                </Route>
                <Route path="/">
                    <div className={classes.root}>
                        <input type="file" onChange={upload} ref={hiddenFileInput} style={{ display: "none" }} multiple={true} />
                        <CssBaseline />

                        <AppBar position="fixed" className={classes.appBar}>
                            <Toolbar>
                                <IconButton color="inherit" aria-label="open drawer" edge="start" onClick={props.handleDrawerToggle} className={classes.menuButton}>
                                    <MenuIcon />
                                </IconButton>
                                <TopBar anySelected={anySelected} buttonFunctions={topBarButtonFunctions} />
                            </Toolbar>
                        </AppBar>

                        {props.drawerElement}

                        <main className={classes.content}>
                            <div className={classes.toolbar} />
                            Album:
                            <AbstractPhotoPage imageClickHandler={imageClickHandler} photos={photos} clickHandler={clickHandler} selected={selected} anySelected={anySelected} />
                        </main>
                    </div>
                </Route>
            </Switch>
            <AddToAlbum albums={albums} open={open} setOpen={setOpen} cb={cb}></AddToAlbum>
        </div>
    );
}
