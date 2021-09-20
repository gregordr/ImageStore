import React, { ChangeEvent, RefObject, useCallback, useEffect, useState } from "react";
import { makeStyles } from "@material-ui/core/styles";
import MenuIcon from "@material-ui/icons/Menu";
import { CssBaseline, AppBar, Toolbar, IconButton, createStyles, Theme, Typography, Backdrop } from "@material-ui/core";
import TopBar from "./TopBar";
import { Route, Switch, useHistory } from "react-router-dom";
import ViewPage from "../ViewPage/ViewPage";
import AddToAlbum from "../Shared/AddToAlbum";
import { PhotoT, AlbumT } from "../../Interfaces";
import AbstractPhotoPage from "../Shared/AbstractPhotoPage";
import { addLabel, addPhotos, addPhotosToAlbums, deletePhotos, download, getAlbums, getPhotoLabels, getPhotos } from "../../API";
import TopRightBar from "./TopRightBar";
import AutoSizer from "react-virtualized-auto-sizer";
import { useSnackbar } from "notistack";
import { useDropzone, FileRejection } from "react-dropzone";
import { UploadErrorSnackbar } from "../Snackbars/UploadErrorSnackbar";
import { CloudUpload } from "@material-ui/icons";
import AutocompleteSearchBar from "../Shared/SearchBar";
import AddLabels from "../Shared/AddLabels";
import ConfirmDeleteDialog from "../Shared/ConfirmDeleteDialog";

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
        onlyMobile: {
            [theme.breakpoints.up("md")]: {
                display: "none",
            },
        },
    })
);

export default function PhotoPage(props: { handleDrawerToggle: () => void; drawerElement: any }) {
    const classes = useStyles();

    const [photos, setPhotos] = useState<PhotoT[]>([]);
    const [albums, setAlbums] = useState<AlbumT[]>([]);
    const [selected, setSelected] = useState<string[]>([]);
    const [selectable, setSelectable] = useState(false);
    const [albumDialogOpen, setAlbumDialogOpen] = useState(false);
    const [labelDialogOpen, setLabelDialogOpen] = useState(false);
    const [showLoadingBar, setShowLoadingBar] = useState(true);
    const [viewId, setViewId] = useState("");

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

    const [showSearchBar, setShowSearchBar] = useState(false);
    const [searchBarText, setSearchBarText] = useState("");
    const [searchTerm, setSearchTerm] = useState("");

    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [onDeleteDialogClose, setOnDeleteDialogClose] = useState<(confirm: boolean) => () => void>(() => (confirm: boolean) => () => {
        setDeleteDialogOpen(false);
        alert("Error onDeleteClose not defined");
    });

    const [autocompleteOptions, setAutocompleteOptions] = useState<string[]>([]);

    useEffect(() => {
        (async () => {
            if (photos.length === 0) setAutocompleteOptions([]);
            else setAutocompleteOptions((await getPhotoLabels(photos.map((photo) => photo.id))).data);
        })();
    }, [photos]);

    const fetchPhotos = async () => {
        setShowLoadingBar(true);
        const resp = await getPhotos(searchTerm);
        if (resp.status === 200) {
            setPhotos(resp.data);
            setShowLoadingBar(false);
        } else {
            window.alert(await resp.data);
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
        fetchPhotos();
        fetchAlbums();
    }, [searchTerm]);

    const history = useHistory();

    const [lastSelected, setLastSelected] = useState<string | undefined>();
    const [hover, setHover] = useState<string | undefined>();
    const [marked, setMarked] = useState<string[]>([]);
    const [ctrl, setCtrl] = useState(false);

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
        document.addEventListener("keydown", (e) => {
            e.key === "Control" && setCtrl(true);
        });

        document.addEventListener("keyup", (e) => {
            e.key === "Control" && setCtrl(false);
        });

        return () => {
            document.removeEventListener("keydown", (e) => e);
            document.removeEventListener("keyup", (e) => e);
        };
    }, []);

    const hoverEventHandler = (id: string) => () => {
        setHover(id);
    };

    const imageClickHandler = (id: string) => () => {
        if (anySelected()) {
            clickHandler(id)();
        } else {
            history.push(`/view/${id}`);
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

    const albumDialogCallback = async (albumIds: any) => {
        topBarButtonFunctions.unselect();
        await addPhotosToAlbums(selected, albumIds, enqueueSnackbar, closeSnackbar);
    };

    const labelDialogCallback = async (labels: any) => {
        topBarButtonFunctions.unselect();
        await addLabel(selected, labels);
    };

    const viewButtonFunctions = {
        delete: async (id: string) => {
            setOnDeleteDialogClose(() => (confirm: boolean) => async () => {
                if (confirm) {
                    await deletePhoto(id);
                }

                setDeleteDialogOpen(false);
            });
            setDeleteDialogOpen(true);
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
    };

    const deletePhoto = async (pid: any) => {
        setPhotos(photos.filter((p) => p.id !== pid));
        await deletePhotos([pid], enqueueSnackbar, closeSnackbar);
    };

    const topBarButtonFunctions = {
        delete: async () => {
            setOnDeleteDialogClose(() => (confirm: boolean) => async () => {
                if (confirm) {
                    topBarButtonFunctions.unselect();
                    await deletePhotos(selected, enqueueSnackbar, closeSnackbar);
                    setPhotos(photos.filter((p) => !selected.includes(p.id)));
                    fetchPhotos();
                }

                setDeleteDialogOpen(false);
            });
            setDeleteDialogOpen(true);
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
            setSearchTerm(s);
        },
        mobileSearch: () => {
            setShowSearchBar(!showSearchBar);
        },
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

        await addPhotos(acceptedFiles, enqueueSnackbar, closeSnackbar, albums);
        await fetchPhotos();
    };

    const topRightBar = (id: string, buttonFunctions: any) => {
        return <TopRightBar id={id} buttonFunctions={buttonFunctions} />;
    };

    const lines = [
        <div></div>,
        <Typography variant="h5" style={{ display: searchTerm === "" || !searchTerm ? "none" : "block", paddingTop: 10, paddingLeft: 5 }}>
            Search results for {searchTerm}:
        </Typography>,
    ];

    const heights = [12, searchTerm === "" || !searchTerm ? 0 : 28];

    return (
        <div>
            <Switch>
                <Route path="/view">
                    <ViewPage setViewId={setViewId} photos={photos} topRightBar={topRightBar} buttonFunctions={viewButtonFunctions} search={(term: string) => { setPhotos([]); setSearchBarText(term); setSearchTerm(term); }}></ViewPage>
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
            <ConfirmDeleteDialog open={deleteDialogOpen} handleClose={onDeleteDialogClose}></ConfirmDeleteDialog>
        </div>
    );
}
