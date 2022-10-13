import React, { ChangeEvent, RefObject, useCallback, useEffect, useState } from "react";
import { makeStyles } from "@material-ui/core/styles";
import MenuIcon from "@material-ui/icons/Menu";
import { CssBaseline, AppBar, Toolbar, IconButton, createStyles, Theme, Typography, Backdrop } from "@material-ui/core";
import AlbumTopBar from "../AlbumPage/AlbumPhotoPage/TopBar";
import PhotoTopBar from "../PhotoPage/TopBar";
import { Route, Switch, useHistory, useLocation } from "react-router-dom";
import ViewPage from "../ViewPage/ViewPage";
import AddToAlbum from "./AddToAlbum";
import { PhotoT, AlbumT } from "../../Interfaces";
import AbstractPhotoPage from "./PhotoGrid";
import { addLabel, addPhotos, addPhotosToAlbums, Box, deletePhotos, download, getAlbums, getPhotoLabels, getPhotosByFaceInAlbum, getPhotosByImageInAlbum, getPhotosInAlbum, removePhotosFromAlbum, setCover, getPhotos, getPhotosByFace, getPhotosByImage, getPhotosByTagInAlbum, getPhotosByTag, getAllLabels, getLabelsInAlbum } from "../../API";
import AlbumTopRightBar from "../AlbumPage/AlbumPhotoPage/TopRightBar";
import PhotoTopRightBar from "../PhotoPage/TopRightBar";
import AutoSizer from "react-virtualized-auto-sizer";
import SearchBar from "material-ui-search-bar";
import { useSnackbar } from "notistack";
import { FileRejection, useDropzone } from "react-dropzone";
import { UploadErrorSnackbar } from "../Snackbars/UploadErrorSnackbar";
import { CloudUpload, LabelOutlined, } from "@material-ui/icons";
import AutocompleteSearchBar, { OptionT, searchTypes, splitTypeAndText } from "./SearchBar";
import AddLabels from "./AddLabels";
import ConfirmDeleteDialog from "./ConfirmDeleteDialog";
import qs from "qs";

const maxSize = parseInt(process.env.MAX_SIZE || (10 * 1024 * 1024 * 1024).toString());
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

export default function PhotoPage(props: { handleDrawerToggle: () => void; drawerElement: any; refresh: () => Promise<void>; searchByImageEnabled: boolean; root: "Photo" | "Album" }) {
    //#region Hooks
    const classes = useStyles();

    const TopBar = props.root == "Photo" ? PhotoTopBar : AlbumTopBar
    const TopRightBar = props.root == "Photo" ? PhotoTopRightBar : AlbumTopRightBar

    const history = useHistory();
    const { search: queryUrl, state: stateUrl } = useLocation() as { search: string, state: { jumpTo?: string } };
    const id = props.root == "Album" ? window.location.pathname.split("/")[2 + process.env.PUBLIC_URL.split("/").length] : "";

    const { search: searchUrlParam } = qs.parse(queryUrl.substr(1)) as { search: string }

    const [photos, setPhotos] = useState<PhotoT[]>([]);
    const [albums, setAlbums] = useState<AlbumT[]>([]);
    const [selected, setSelected] = useState<string[]>([]);
    const [selectable, setSelectable] = useState(false);
    const [albumDialogOpen, setAlbumDialogOpen] = useState(false);
    const [labelDialogOpen, setLabelDialogOpen] = useState(false);
    const [showLoadingBar, setShowLoadingBar] = useState(true);
    const [viewId, setViewId] = useState(stateUrl?.jumpTo ?? "");

    const [onDeleteDialogState, setOnDeleteDialogState] = useState<{ open: boolean; handleClose: (confirm: boolean) => () => void }>({
        open: false, handleClose: () => () => { }
    });

    const [showSearchBar, setShowSearchBar] = useState(false);
    const [searchBarText, setSearchBarText] = useState(searchUrlParam ?? "");
    const rawSearchQuery = searchUrlParam ?? "";

    const [searchType, searchText] = splitTypeAndText(rawSearchQuery)

    const [autocompleteOptions, setAutocompleteOptions] = useState<OptionT[]>([]);

    useEffect(() => {
        (async () => {
            if (photos.length === 0) setAutocompleteOptions([]);
            else setAutocompleteOptions((await (props.root === "Photo" ? getAllLabels() : getLabelsInAlbum(id))).data.map((label: string) => ({ label, icon: <LabelOutlined />, searchText: searchTypes.tag + label, searchType: searchTypes.tag })));
        })();
    }, [photos]);

    const { enqueueSnackbar, closeSnackbar } = useSnackbar();
    const {
        getRootProps,
        open: openM,
        getInputProps,
        acceptedFiles,
        fileRejections,
        isDragActive,
    } = useDropzone({
        // Disable click and keydown behavior
        noClick: true,
        noKeyboard: true,
        accept: "image/*, video/*",
    });

    useEffect(() => {
        upload(acceptedFiles, fileRejections);
    }, [acceptedFiles, fileRejections]);

    const search = () => {
        if (props.root == "Photo") {
            if (searchType === searchTypes.text) return getPhotos(searchText)
            if (searchType === searchTypes.tag) return getPhotosByTag(searchText)
            if (searchType === searchTypes.image) return getPhotosByImage(searchText)
            if (searchType === searchTypes.face) return getPhotosByFace(searchText)
            return getPhotos("")
        } else if (props.root == "Album") {
            if (searchType === searchTypes.text) return getPhotosInAlbum(id, searchText)
            if (searchType === searchTypes.tag) return getPhotosByTagInAlbum(id, searchText)
            if (searchType === searchTypes.image) return getPhotosByImageInAlbum(id, searchText)
            if (searchType === searchTypes.face) return getPhotosByFaceInAlbum(id, searchText)
            return getPhotosInAlbum(id, "")
        } else throw new Error("Wrong root type")
    }

    const fetchPhotos = async () => {
        setShowLoadingBar(true);
        const resp = await search();
        if (resp.status === 200) {
            setPhotos(resp.data);
            setShowLoadingBar(false);
        } else {
            window.alert(resp.data);
        }
    };

    const fetchAlbums = async () => {
        const resp = await getAlbums("");
        if (resp.status === 200) {
            setAlbums(resp.data);
        } else {
            window.alert(await resp.data);
        }
    };

    useEffect(() => {
        setPhotos([])
        fetchPhotos();
        fetchAlbums();
    }, [rawSearchQuery, searchType, id]);

    const [lastSelected, setLastSelected] = useState<string | undefined>();
    const [hover, setHover] = useState<string | undefined>();
    const [marked, setMarked] = useState<string[]>([]);
    const [ctrl, setCtrl] = useState(false);
    //#endregion hooks

    //#region API

    const albumDialogCallback = async (albumIds: string[]) => {
        topBarButtonFunctions.unselect();
        await addPhotosToAlbums(selected, albumIds, enqueueSnackbar, closeSnackbar);
        await props.refresh();
    };

    const labelDialogCallback = async (labels: any) => {
        topBarButtonFunctions.unselect();
        await addLabel(selected, labels);
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

        const acceptedFiles: File[] = [];

        files.forEach((file) => {
            if (file.size > maxSize) {
                fileRejections.push({ file, errors: [{ message: `File is bigger than ${maxSize / (1024 * 1024 * 1024)} GB`, code: "file-too-large" }] });
            } else {
                acceptedFiles.push(file);
            }
        });

        const snackbar = UploadErrorSnackbar.createInstance(enqueueSnackbar, closeSnackbar);
        snackbar?.begin(fileRejections);

        if (acceptedFiles.length === 0) return;
        const data = await addPhotos(acceptedFiles, enqueueSnackbar, closeSnackbar, albums);

        if (props.root == "Album")
            await addPhotosToAlbums(data, [id], enqueueSnackbar, closeSnackbar);
        await fetchPhotos();
        await props.refresh();
    };
    //#endregion API

    //#region handlers

    const photoSelection = useCallback(
        (inclusive: string, exclusive: string): string[] => {
            if (inclusive === exclusive) return [];
            const selection = [inclusive];
            let include = false;
            for (const photo of photos) {
                if ((photo.id === inclusive || photo.id === exclusive) && include) {
                    break;
                }

                if (include) selection.push(photo.id);

                if (photo.id === inclusive || photo.id === exclusive) {
                    include = true;
                }
            }

            return selection;
        },
        [photos]
    );

    useEffect(() => {
        const ctrlKeyDown = (e: KeyboardEvent) => {
            e.key === "Control" && setCtrl(true);
        }
        const ctrlKeyUp = (e: KeyboardEvent) => {
            e.key === "Control" && setCtrl(false);
        }
        document.addEventListener("keydown", ctrlKeyDown);

        document.addEventListener("keyup", ctrlKeyUp);

        return () => {
            document.removeEventListener("keydown", ctrlKeyDown);
            document.removeEventListener("keyup", ctrlKeyUp);
        };
    }, []);

    const hoverEventHandler = (id: string) => () => {
        setHover(id);
    };

    const imageClickHandler = (photoId: string) => () => {
        if (anySelected()) {
            clickHandler(photoId)();
        } else if (props.root == "Album") {
            history.push(`/albums/open/${id}/view/${photoId}` + queryUrl);
        } else if (props.root == "Photo") {
            history.push(`/view/${photoId}` + queryUrl);
        }
    };

    const clickHandler = (clickedPhotoId: string) => () => {
        let copy = selected.slice();
        let toggleSet = [clickedPhotoId];
        if (anySelected() && lastSelected && ctrl) {
            toggleSet = photoSelection(clickedPhotoId, lastSelected);
        }
        setLastSelected(clickedPhotoId);
        for (const id of toggleSet) {
            if (copy.includes(id)) copy = copy.filter((v) => v !== id);
            else copy.push(id);
        }

        setSelected(copy);
        if (copy.length === 0) {
            setSelectable(false);
        }
    };

    const anySelected = useCallback(() => {
        return selected.length !== 0 || selectable;
    }, [selectable, selected.length]);

    useEffect(() => {
        if (anySelected() && lastSelected && hover && ctrl) {
            setMarked(photoSelection(hover, lastSelected));
        } else {
            setMarked([]);
        }
    }, [lastSelected, hover, ctrl, anySelected, photoSelection]);


    const searchByText = (text: string) => {
        setSearchBarText(text)
        history.push({ search: qs.stringify({ search: text }) })
    }

    const searchByTag = (tag: string) => {
        setSearchBarText(searchTypes.tag + tag)
        history.push({ search: qs.stringify({ search: searchTypes.tag + tag }) })
    }

    const searchByImageId = (id: string) => {
        setSearchBarText(searchTypes.image + id)
        history.push({ search: qs.stringify({ search: searchTypes.image + id }) })
    }

    const searchByFace = (id: string, box: Box) => {
        setSearchBarText(searchTypes.face + id + "||" + box.toJSON())
        history.push({ search: qs.stringify({ search: searchTypes.face + id + "||" + box.toJSON() }) })
    }

    const viewButtonFunctions = {
        delete: async (id: string) => {
            setOnDeleteDialogState({
                open: true,
                handleClose: (confirm: boolean) => async () => {
                    if (confirm) {
                        await deletePhoto(id);
                        await props.refresh();
                    }

                    setOnDeleteDialogState({ open: false, handleClose: () => () => { } });
                }
            });
        },
        addToAlbum: (id: string) => {
            setSelected([id]);
            setAlbumDialogOpen(true);
        },
        download: async (id: string) => {
            await download(
                photos.filter((photo) => id === photo.id),
                enqueueSnackbar,
                closeSnackbar
            );
        },
        searchByImageId,

        //Albums
        remove: async (id: string) => {
            await removePhoto(id);
            setPhotos(photos.filter((p) => p.id !== id));
            // await fetchPhotos();
            await props.refresh();
        },
        setCover: async (photoID: string) => {
            await setCover(id, photoID);
            await props.refresh();
        },
    };

    const topBarButtonFunctions = {
        delete: async () => {
            setOnDeleteDialogState({
                open: true, handleClose: (confirm: boolean) => async () => {
                    if (confirm) {
                        topBarButtonFunctions.unselect();
                        await deletePhotos(selected, enqueueSnackbar, closeSnackbar);
                        setPhotos(photos.filter((p) => !selected.includes(p.id)));

                        if (props.root == "Photo")
                            fetchPhotos();
                        else
                            await props.refresh();
                    }

                    setOnDeleteDialogState({ open: false, handleClose: () => () => { } });
                }
            });
        },
        unselect: () => {
            setSelected([]);
            setSelectable(false);
        },
        upload: () => {
            openM();
        },
        settings: () => {
            //Nav to settings page
        },
        select: () => {
            setSelectable(!selectable);
        },
        addToAlbum: () => {
            setAlbumDialogOpen(true);
        },
        label: () => {
            setLabelDialogOpen(true);
        },
        download: async () => {
            topBarButtonFunctions.unselect();
            await download(
                photos.filter((photo) => selected.includes(photo.id)),
                enqueueSnackbar,
                closeSnackbar
            );
        },
        search: (s: string) => async () => {
            history.push({ search: qs.stringify(s !== "" ? { search: s } : {}) })
        },
        mobileSearch: () => {
            setShowSearchBar(!showSearchBar);
        },

        // Albums
        setCover: async () => {
            await setCover(id, selected[0]);
            topBarButtonFunctions.unselect();
            await props.refresh();
        },
        remove: async () => {
            topBarButtonFunctions.unselect();
            await removePhotosFromAlbum(selected, id, enqueueSnackbar, closeSnackbar);
            setPhotos(photos.filter((p) => !selected.includes(p.id)));

            await props.refresh();
        },
    };

    //#endregion handlers

    const topRightBar = (id: string, buttonFunctions: any, searchByImageEnabled: boolean) => {
        return <TopRightBar id={id} buttonFunctions={buttonFunctions} searchByImageEnabled={searchByImageEnabled} />;
    };

    const lines = [
        <div></div>,
        props.root == "Album" ?
            <Typography variant="h4" style={{ paddingTop: 10, paddingLeft: 5 }}>
                {(albums.find((album: AlbumT) => album.id.toString() === id) || { name: "" }).name}
            </Typography> : <></>,
        <Typography variant="h5" style={{ display: rawSearchQuery === "" || !rawSearchQuery ? "none" : "block", paddingLeft: 5 }}>
            Search results for {rawSearchQuery}:
        </Typography>,
    ];

    const heights = [12, props.root == "Album" ? 42 : 0, rawSearchQuery === "" || !rawSearchQuery ? 0 : 28];

    return (
        <div>
            <Switch>
                <Route path={props.root == "Photo" ? "/view" : "/albums/open/:albumID/view"}>
                    <ViewPage
                        setViewId={setViewId}
                        photos={photos}
                        topRightBar={topRightBar}
                        buttonFunctions={viewButtonFunctions}
                        search={(tag: string) => { searchByText(tag) }}
                        searchByTag={(tag: string) => { searchByTag(tag) }}
                        searchByFace={searchByFace}
                        searchByImageEnabled={props.searchByImageEnabled} ></ViewPage>
                </Route>
                <Route path="/">
                    <div {...getRootProps({ className: "dropzone" })} className={classes.root}>
                        <Backdrop
                            open={isDragActive}
                            transitionDuration={150}
                            style={{
                                zIndex: 1201,
                                backgroundColor: "#00006666",
                            }}
                        >
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
                                <TopBar
                                    searchBarText={searchBarText}
                                    setSearchBarText={setSearchBarText}
                                    autocompleteOptions={autocompleteOptions}
                                    anySelected={anySelected}
                                    buttonFunctions={topBarButtonFunctions}
                                    numSelected={() => selected.length}
                                    show={showLoadingBar}
                                />
                            </Toolbar>
                        </AppBar>

                        {props.drawerElement}

                        <main className={classes.content}>
                            <div className={classes.toolbar} />
                            {showSearchBar && (
                                <AutocompleteSearchBar
                                    options={autocompleteOptions}
                                    search={topBarButtonFunctions.search}
                                    className={classes.onlyMobile}
                                    value={searchBarText}
                                    onChange={(s: string) => setSearchBarText(s)}
                                    onRequestSearch={topBarButtonFunctions.search(searchBarText)}
                                    style={{ marginLeft: -6, borderRadius: 0, alignSelf: "flex-top" }}
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
                                            hoverEventHandler={hoverEventHandler}
                                            searchByImageId={searchByImageId}
                                            searchByImageEnabled={props.searchByImageEnabled}
                                            marked={marked}
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
            <AddToAlbum albums={albums} open={albumDialogOpen} setOpen={setAlbumDialogOpen} cb={albumDialogCallback} />
            <AddLabels open={labelDialogOpen} setOpen={setLabelDialogOpen} cb={labelDialogCallback}></AddLabels>
            <ConfirmDeleteDialog state={onDeleteDialogState}></ConfirmDeleteDialog>
        </div>
    );
}
