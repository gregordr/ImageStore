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

const theme = createMuiTheme({
    palette: {
        primary: {
            main: "#cccccc",
            dark: "#cccccc",
            light: "#cccccc",
        },
    },
});

function Album(props: { album: AlbumT; click: () => void; fetchAlbums: () => Promise<void> }) {
    const useStyles = makeStyles((theme: Theme) =>
        createStyles({
            root: {
                overflow: "hidden",
                backgroundColor: theme.palette.background.paper,
                margin: 10,
                padding: 5,
            },
            gridList: {
                width: 500,
                height: 450,
            },
            icon: {
                color: "rgba(255, 255, 255, 0.54)",
            },
            photoDiv: {
                margin: 5,
                // height: props.y,
                // width: props.x,
                // "align-items": "center",
                // "justify-content": "center",
                display: "flex",
                flexFlow: "row wrap",
                // background: "#aaaaaa33",
                // position: "relative",
            },
            // photoBox: { transition: "0.07s all  linear", position: "absolute", left: 15, top: 15, height: 20, width: 20, opacity: opacity },
        })
    );

    const classes = useStyles();
    const history = useHistory();
    const [openInfo, setOpenInfo] = useState(false);

    const onImageClick = () => {
        history.push(`/albums/open/${props.album.id}`);
    };

    const onInfoClick = () => {};

    return (
        <GridList className={classes.root}>
            <GridListTile key={props.album.id} style={{ height: 200, width: 200 }} onClick={onImageClick}>
                {props.album.cover === null ? (
                    <PhotoAlbum style={{ height: 200, width: 200, color: "#666666" }} />
                ) : (
                    <img src={"http://localhost:4000/media/" + props.album.cover} alt={props.album.name} />
                )}
                <GridListTileBar
                    title={props.album.name}
                    subtitle={<span>{props.album.imagecount} elements</span>}
                    actionIcon={
                        <div
                            onClick={(e) => {
                                e.stopPropagation();
                                onInfoClick();
                            }}
                        >
                            <ThemeProvider theme={theme}>
                                <IconButton aria-label={`info about ${props.album.name}`} color="primary" onClick={() => setOpenInfo(true)} className={classes.icon}>
                                    <Info />
                                </IconButton>
                            </ThemeProvider>
                        </div>
                    }
                />
            </GridListTile>
            <AlbumInfo album={props.album} open={openInfo} setOpen={setOpenInfo} fetchAlbums={props.fetchAlbums}></AlbumInfo>
        </GridList>
    );
}

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

    const [searchTerm, setSearchTerm] = useState("");
    const url = searchTerm === "" ? "albums/all" : "albums/search/" + searchTerm;

    const fetchAlbums = async () => {
        const resp = await axios.get(url);
        if (resp.status === 200) {
            setAlbums(resp.data);
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

    const makeAlbum = (album: AlbumT) => <Album key={album.id} album={album} click={openAlbum(album)} fetchAlbums={fetchAlbums} />;

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
                                <TopBar buttonFunctions={topBarButtonFunctions} />
                            </Toolbar>
                        </AppBar>

                        {props.drawerElement}

                        <main className={classes.content}>
                            <div className={classes.toolbar} />
                            <Typography variant="h5" style={{ display: searchTerm === "" ? "none" : "block" }}>
                                Search results for {searchTerm}:
                            </Typography>
                            <div style={{ display: "flex", flexWrap: "wrap" }}>{albums.map((p) => makeAlbum(p))}</div>
                        </main>
                    </div>
                </Route>
            </Switch>
            <CreateAlbum albums={albums} open={openCreateAlbum} setOpen={setOpenCreateAlbum} cb={createAlbumCallback} />
        </div>
    );
}
