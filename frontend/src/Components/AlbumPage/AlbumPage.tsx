import React, { useEffect, useState } from "react";
import { makeStyles } from "@material-ui/core/styles";
import MenuIcon from "@material-ui/icons/Menu";
import { CssBaseline, AppBar, Toolbar, IconButton, createStyles, Theme, GridListTile, GridListTileBar, GridList, createMuiTheme, ThemeProvider, Typography } from "@material-ui/core";
import TopBar from "./TopBar";
import { Route, Switch, useHistory } from "react-router-dom";
import axios from "axios";
import { AlbumT } from "../../Interfaces";
import CreateAlbum from "./CreateAlbum";
import { Info, PhotoAlbum } from "@material-ui/icons";
import AlbumPhotoPage from "./AlbumPhotoPage/AlbumPhotoPage";
import AlbumInfo from "./AlbumInfo";
import AbstractAlbumPage from "../Shared/AbstractAlbumPage";
import AutoSizer from "react-virtualized-auto-sizer";

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

export default function AlbumPage(props: { handleDrawerToggle: () => void; drawerElement: any }) {
    const classes = useStyles();

    const [albums, setAlbums] = useState<AlbumT[]>([]);
    const [openCreateAlbum, setOpenCreateAlbum] = useState(false);
    const [showLoadingBar, setShowLoadingBar] = useState(true);

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

        console.log(resp.data);
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
    };

    const createAlbumCallback = async (name: string) => {
        await axios.post("/albums/new/" + name);
        await fetchAlbums();
    };

    const openAlbum = (album: AlbumT) => () => {};

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
                            <AutoSizer
                                style={{
                                    height: `calc(100vh - ${64 * 2}px)`,
                                }}
                            >
                                {({ height, width }) => (
                                    <AbstractAlbumPage height={height} width={width} albums={albums} openAlbum={openAlbum} fetchAlbums={fetchAlbums} lines={lines} heights={heights} />
                                )}
                            </AutoSizer>
                        </main>
                    </div>
                </Route>
            </Switch>
            <CreateAlbum albums={albums} open={openCreateAlbum} setOpen={setOpenCreateAlbum} cb={createAlbumCallback} />
        </div>
    );
}
