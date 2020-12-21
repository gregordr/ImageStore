import React, { useEffect, useState } from "react";
import { makeStyles } from "@material-ui/core/styles";
import MenuIcon from "@material-ui/icons/Menu";
import { CssBaseline, AppBar, Toolbar, IconButton, createStyles, Theme, Typography } from "@material-ui/core";
import TopBar from "./TopBar";
import { Route, Switch } from "react-router-dom";
import axios from "axios";
import { AlbumT } from "../../Interfaces";
import CreateAlbum from "./CreateAlbum";
import AlbumPhotoPage from "./AlbumPhotoPage/AlbumPhotoPage";
import AbstractAlbumPage from "../Shared/AbstractAlbumPage";
import AutoSizer from "react-virtualized-auto-sizer";
import SearchBar from "material-ui-search-bar";
import { createAlbum } from "../../API";

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
        onlyMobile: {
            [theme.breakpoints.up("md")]: {
                display: "none",
            },
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

export default function AlbumPage(props: { handleDrawerToggle: () => void; drawerElement: any }) {
    const classes = useStyles();

    const [albums, setAlbums] = useState<AlbumT[]>([]);
    const [openCreateAlbum, setOpenCreateAlbum] = useState(false);
    const [showLoadingBar, setShowLoadingBar] = useState(true);

    const [showSearchBar, setShowSearchBar] = useState(false);
    const [searchBarText, setSearchBarText] = useState("");
    const [searchTerm, setSearchTerm] = useState("");
    const url = searchTerm === "" ? "albums/all" : "albums/search/" + searchTerm;

    const fetchAlbums = async () => {
        setShowLoadingBar(true);
        const resp = await axios.get(url);
        if (resp.status === 200) {
            setAlbums(resp.data);
            setShowLoadingBar(false);
        } else {
            window.alert(await resp.data);
        }
    };

    useEffect(() => {
        fetchAlbums();
    }, [url]);

    const topBarButtonFunctions = {
        add: async () => {
            setOpenCreateAlbum(true);
        },
        search: (s: string) => async () => {
            setSearchTerm(s);
        },
        mobileSearch: () => {
            setShowSearchBar(!showSearchBar);
        },
    };

    const createAlbumCallback = async (name: string) => {
        await createAlbum(name);
        await fetchAlbums();
    };

    const openAlbum = () => () => { };

    const heights = [searchTerm === "" ? 0 : 20];

    const lines = [
        <Typography variant="h5" style={{ display: searchTerm === "" ? "none" : "block" }}>
            Search results for {searchTerm}:
        </Typography>,
    ];

    return (
        <div>
            <Switch>
                <Route path="/albums/open">
                    <AlbumPhotoPage refresh={fetchAlbums} drawerElement={props.drawerElement} handleDrawerToggle={props.handleDrawerToggle} />
                </Route>
                <Route path="/albums/">
                    <div className={classes.root}>
                        <CssBaseline />

                        <AppBar position="fixed" className={classes.appBar}>
                            <Toolbar>
                                <IconButton color="inherit" aria-label="open drawer" edge="start" onClick={props.handleDrawerToggle} className={classes.menuButton}>
                                    <MenuIcon />
                                </IconButton>
                                <TopBar buttonFunctions={topBarButtonFunctions} show={showLoadingBar} />
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
                                    style={{ marginLeft: -12, borderRadius: 0 }}
                                    className={classes.onlyMobile}
                                    value={searchBarText}
                                    onChange={(s) => setSearchBarText(s)}
                                    onRequestSearch={topBarButtonFunctions.search(searchBarText)}
                                />
                            )}
                            <div style={{ flexGrow: 1 }}>
                                <AutoSizer>
                                    {({ height, width }) => (
                                        <AbstractAlbumPage height={height - 1} width={width} albums={albums} openAlbum={openAlbum} fetchAlbums={fetchAlbums} lines={lines} heights={heights} />
                                    )}
                                </AutoSizer>
                            </div>
                        </main>
                    </div>
                </Route>
            </Switch>
            <CreateAlbum albums={albums} open={openCreateAlbum} setOpen={setOpenCreateAlbum} cb={createAlbumCallback} />
        </div>
    );
}
