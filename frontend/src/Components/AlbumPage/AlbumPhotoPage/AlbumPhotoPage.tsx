import React, { ChangeEvent, RefObject, useEffect, useState } from "react";
import { makeStyles } from "@material-ui/core/styles";
import MenuIcon from "@material-ui/icons/Menu";
import { CssBaseline, AppBar, Toolbar, IconButton, createStyles, Theme, Typography, Backdrop } from "@material-ui/core";
import TopBar from "./TopBar";
import { Route, Switch, useHistory } from "react-router-dom";
import ViewPage from "../../ViewPage/ViewPage";
import axios from "axios";
import AddToAlbum from "../../Shared/AddToAlbum";
import { PhotoT, AlbumT } from "../../../Interfaces";
import AbstractPhotoPage from "../../Shared/AbstractPhotoPage";
import { addPhotos, addPhotosToAlbums, deletePhotos, download, removePhotosFromAlbum, setCover } from "../../../API";
import TopRightBar from "./TopRightBar";
import AutoSizer from "react-virtualized-auto-sizer";
import SearchBar from "material-ui-search-bar";
import { useSnackbar } from "notistack";
import { FileRejection, useDropzone } from "react-dropzone";
import { UploadErrorSnackbar } from "../../Snackbars/UploadErrorSnackbar";
import { CloudUpload } from "@material-ui/icons";

const maxFileSize = 50 * 1000 * 1000;
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
        onlyMobile: {
            [theme.breakpoints.up("md")]: {
                display: "none",
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
        toolbar: {
            ...theme.mixins.toolbar,
            height: 64,
        },
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
            paddingLeft: 12,
            display: "flex",
            flexDirection: "column",
            height: "100vh",
        },
    })
);

export default function AlbumPhotoPage(props: { handleDrawerToggle: () => void; drawerElement: any; refresh: () => Promise<void> }) {
    //#region Hooks
    const classes = useStyles();

    const history = useHistory();
    const id = window.location.pathname.split("/")[3];

    const [photos, setPhotos] = useState<PhotoT[]>([]);
    const [albums, setAlbums] = useState<AlbumT[]>([]);
    const [selected, setSelected] = useState<string[]>([]);
    const [selectable, setSelectable] = useState(false);
    const [open, setOpen] = useState(false);
    const [showLoadingBar, setShowLoadingBar] = useState(true);
    const [viewId, setViewId] = useState("");

    const [showSearchBar, setShowSearchBar] = useState(false);
    const [searchBarText, setSearchBarText] = useState("");
    const [searchTerm, setSearchTerm] = useState("");
    const url = searchTerm === "" ? `albums/${id}/all` : `albums/${id}/search/${searchTerm}`;

    const { enqueueSnackbar, closeSnackbar } = useSnackbar();
    const { getRootProps, open: openM, getInputProps, acceptedFiles, fileRejections, isDragActive } = useDropzone({
        // Disable click and keydown behavior
        noClick: true,
        noKeyboard: true,
        accept: 'image/jpeg, image/png',
    })

    useEffect(() => { upload(acceptedFiles, fileRejections) }, [acceptedFiles, fileRejections])

    const fetchPhotos = async () => {
        setShowLoadingBar(true);
        const resp = await axios.get(url);
        if (resp.status === 200) {
            setPhotos(resp.data);
            setShowLoadingBar(false);
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
    }, [url]);
    //#endregion hooks

    //#region API

    const cb = async (albumIds: string[]) => {
        topBarButtonFunctions.unselect();
        await addPhotosToAlbums(selected, albumIds, enqueueSnackbar, closeSnackbar);
        await props.refresh();
    };

    const deletePhoto = async (pid: string) => {
        setPhotos(photos.filter((p) => p.id !== pid));
        await deletePhotos([pid], enqueueSnackbar, closeSnackbar);
    };

    const removePhoto = async (pid: string) => {
        setPhotos(photos.filter((p) => p.id !== pid));
        await removePhotosFromAlbum([pid], id, enqueueSnackbar, closeSnackbar);
    };

    const upload = async (files: File[], fileRejections: FileRejection[]) => {
        if (!files) return;

        const formData = new FormData();
        files.forEach((file) => {
            if (file.size > maxFileSize) {
                fileRejections.push({ file, errors: [{ message: `File is bigger than ${maxFileSize} bytes`, code: "file-too-large" }] })
            } else {
                formData.append("file", file);
            }
        });

        const snackbar = UploadErrorSnackbar.createInstance(enqueueSnackbar, closeSnackbar);
        snackbar?.begin(fileRejections)

        if (formData.getAll("file").length === 0) return;
        const data = await addPhotos(formData, enqueueSnackbar, closeSnackbar, albums);

        await addPhotosToAlbums(data, [id], enqueueSnackbar, closeSnackbar);
        await fetchPhotos();
        await props.refresh();
    };
    //#endregion API

    //#region handlers

    const imageClickHandler = (photoId: string) => () => {
        if (anySelected()) {
            clickHandler(photoId)();
        } else {
            history.push(`/albums/open/${id}/view/${photoId}`);
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

    const viewButtonFunctions = {
        delete: async (id: string) => {
            await deletePhoto(id);
            await fetchPhotos();
            await props.refresh();
        },
        remove: async (id: string) => {
            await removePhoto(id);
            setPhotos(photos.filter((p) => p.id !== id));
            await fetchPhotos();
            await props.refresh();
        },
        addToAlbum: (id: string) => {
            setSelected([id]);
            setOpen(true);
        },
        setCover: async (photoID: string) => {
            await setCover(id, photoID);
            await props.refresh();
        },
        download: async (id: string) => {
            await download(
                photos.filter((photo) => id === photo.id),
                enqueueSnackbar,
                closeSnackbar
            );
        },
    };

    const topBarButtonFunctions = {
        setCover: async () => {
            await setCover(id, selected[0]);
            topBarButtonFunctions.unselect();
            await props.refresh();
        },
        delete: async () => {
            topBarButtonFunctions.unselect();
            await deletePhotos(selected, enqueueSnackbar, closeSnackbar);
            setPhotos(photos.filter((p) => !selected.includes(p.id)));

            await fetchPhotos();
            await props.refresh();
        },
        remove: async () => {
            topBarButtonFunctions.unselect();
            await removePhotosFromAlbum(selected, id, enqueueSnackbar, closeSnackbar);
            setPhotos(photos.filter((p) => !selected.includes(p.id)));

            await fetchPhotos();
            await props.refresh();
        },
        unselect: () => {
            setSelected([]);
            setSelectable(false);
        },
        upload: () => {
            openM()
        },
        settings: () => {
            //Nav to settings page
        },
        select: () => {
            setSelectable(!selectable);
        },
        addToAlbum: () => {
            setOpen(true);
        },
        download: async () => {
            topBarButtonFunctions.unselect();
            download(
                photos.filter((photo) => selected.includes(photo.id)),
                enqueueSnackbar,
                closeSnackbar
            );
        },
        search: (s: string) => async () => {
            setSearchTerm(s);
        },
        mobileSearch: () => {
            setShowSearchBar(!showSearchBar);
        },
    };

    //#endregion handlers

    const topRightBar = (id: string, buttonFunctions: any) => {
        return <TopRightBar id={id} buttonFunctions={buttonFunctions} />;
    };

    const lines = [
        <div> </div>,
        <Typography variant="h4" style={{ paddingTop: 10, paddingLeft: 5 }}>
            {(albums.find((album: AlbumT) => album.id.toString() === id) || { name: "" }).name}
        </Typography>,
        <Typography variant="h5" style={{ display: searchTerm === "" ? "none" : "block", paddingLeft: 5 }}>
            Search results for {searchTerm}:
        </Typography>,
    ];

    const heights = [12, 42, searchTerm === "" ? 0 : 28];

    return (
        <div>
            <Switch>
                <Route path="/albums/open/:albumID/view">
                    <ViewPage setViewId={setViewId} photos={photos} topRightBar={topRightBar} buttonFunctions={viewButtonFunctions}></ViewPage>
                </Route>
                <Route path="/">
                    <div  {...getRootProps({ className: 'dropzone' })} className={classes.root} >
                        <Backdrop open={isDragActive} transitionDuration={150} style={{
                            zIndex: 1201,
                            justifyContent: "center",
                            alignItems: "center",
                            backgroundColor: "#00006666",
                        }}>
                            <div>
                                <CloudUpload style={{ fontSize: 200, color: "#1976d2aa" }}></CloudUpload>
                            </div>
                        </Backdrop>

                        <input {...getInputProps()} />
                        <CssBaseline />

                        <AppBar position="fixed" className={classes.appBar}>
                            <Toolbar>
                                <IconButton color="inherit" aria-label="open drawer" edge="start" onClick={props.handleDrawerToggle} className={classes.menuButton}>
                                    <MenuIcon />
                                </IconButton>
                                <TopBar numSelected={() => selected.length} buttonFunctions={topBarButtonFunctions} show={showLoadingBar} />
                            </Toolbar>
                        </AppBar>

                        {props.drawerElement}

                        <main className={classes.content}>
                            <div className={classes.toolbar} />
                            {showSearchBar && (
                                <SearchBar
                                    onCancelSearch={async () => {
                                        setSearchBarText("");
                                        topBarButtonFunctions.search("")();
                                    }}
                                    style={{ marginLeft: -12, borderRadius: 0, alignSelf: "flex-top" }}
                                    className={classes.onlyMobile}
                                    value={searchBarText}
                                    onChange={(s) => setSearchBarText(s)}
                                    onRequestSearch={topBarButtonFunctions.search(searchBarText)}
                                />
                            )}
                            <div style={{ flexGrow: 1 }}>
                                <AutoSizer>
                                    {({ height, width }) => (
                                        <AbstractPhotoPage
                                            height={height - 1}
                                            width={width}
                                            photos={photos}
                                            clickHandler={clickHandler}
                                            selected={selected}
                                            anySelected={anySelected}
                                            imageClickHandler={imageClickHandler}
                                            lines={lines}
                                            heights={heights}
                                            viewId={viewId}
                                            setViewId={setViewId}
                                        />
                                    )}
                                </AutoSizer>
                            </div>
                        </main>
                    </div>
                </Route>
            </Switch>
            <AddToAlbum albums={albums} open={open} setOpen={setOpen} cb={cb}></AddToAlbum>
        </div>
    );
}
