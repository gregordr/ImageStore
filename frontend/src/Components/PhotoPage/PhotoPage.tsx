import React, { ChangeEvent, RefObject, useEffect, useState } from "react";
import { makeStyles } from "@material-ui/core/styles";
import MenuIcon from "@material-ui/icons/Menu";
import { CssBaseline, AppBar, Toolbar, IconButton, createStyles, Theme, Typography, Button } from "@material-ui/core";
import TopBar from "./TopBar";
import { Route, Switch, useHistory } from "react-router-dom";
import ViewPage from "../ViewPage/ViewPage";
import axios from "axios";
import AddToAlbum from "../Shared/AddToAlbum";
import qs from "qs";
import { PhotoT, AlbumT } from "../../Interfaces";
import AbstractPhotoPage from "../Shared/AbstractPhotoPage";
import { addPhotos, addPhotosToAlbums, deletePhotos, download } from "../../API";
import TopRightBar from "./TopRightBar";
import AutoSizer from "react-virtualized-auto-sizer";
import SearchBar from "material-ui-search-bar";
import { useSnackbar } from "notistack";

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
    const hiddenFileInput: RefObject<HTMLInputElement> = React.useRef(null);

    const [photos, setPhotos] = useState<PhotoT[]>([]);
    const [albums, setAlbums] = useState<AlbumT[]>([]);
    const [selected, setSelected] = useState<string[]>([]);
    const [selectable, setSelectable] = useState(false);
    const [open, setOpen] = useState(false);
    const [showLoadingBar, setShowLoadingBar] = useState(true);
    const [viewId, setViewId] = useState("");

    const { enqueueSnackbar, closeSnackbar } = useSnackbar();

    const [showSearchBar, setShowSearchBar] = useState(false);
    const [searchBarText, setSearchBarText] = useState("");

    const [searchTerm, setSearchTerm] = useState("");
    const url = searchTerm === "" ? "media/all" : "media/search/" + searchTerm;

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

    const history = useHistory();

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

    const anySelected = () => {
        return selected.length !== 0 || selectable;
    };

    const cb = async (albumIds: any) => {
        await addPhotosToAlbums(selected, albumIds);
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
        download: async (id: string) => {
            await download(photos.filter((photo) => id === photo.id));
        },
    };

    const deletePhoto = async (pid: any) => {
        await deletePhotos([pid]);
    };

    const topBarButtonFunctions = {
        delete: async () => {
            await deletePhotos(selected);
            topBarButtonFunctions.unselect();
            await fetchPhotos();
        },
        unselect: () => {
            setSelected([]);
            setSelectable(false);
        },
        upload: () => {
            if (!hiddenFileInput || !hiddenFileInput.current) {
                console.log("hiddenFileInput is null");
            } else {
                hiddenFileInput.current.click();
            }
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
            await download(photos.filter((photo) => selected.includes(photo.id)));
            topBarButtonFunctions.unselect();
        },
        search: (s: string) => async () => {
            setSearchTerm(s);
        },
        mobileSearch: () => {
            setShowSearchBar(!showSearchBar);
        },
    };

    const toAlbum = (photos: string[]) => {
        setSelected(photos);
        topBarButtonFunctions.addToAlbum();
    };

    const upload = async (event: ChangeEvent<HTMLInputElement>) => {
        if (!event.target.files) return;
        const formData = new FormData();
        for (const file of event.target.files) {
            formData.append("file", file);
        }
        event.target.value = "";

        await addPhotos(formData, enqueueSnackbar, closeSnackbar, toAlbum);
        await fetchPhotos();
    };

    const topRightBar = (id: string, buttonFunctions: any) => {
        return <TopRightBar id={id} buttonFunctions={buttonFunctions} />;
    };

    const lines = [
        <div></div>,
        <Typography variant="h5" style={{ display: searchTerm === "" ? "none" : "block", paddingTop: 10, paddingLeft: 5 }}>
            Search results for {searchTerm}:
        </Typography>,
    ];

    const heights = [12, searchTerm === "" ? 0 : 28];

    return (
        <div>
            <Switch>
                <Route path="/view">
                    <ViewPage setViewId={setViewId} photos={photos} topRightBar={topRightBar} buttonFunctions={viewButtonFunctions}></ViewPage>
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
                                <TopBar anySelected={anySelected} buttonFunctions={topBarButtonFunctions} numSelected={() => selected.length} show={showLoadingBar} />
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
            <AddToAlbum albums={albums} open={open} setOpen={setOpen} cb={cb} />
        </div>
    );
}
