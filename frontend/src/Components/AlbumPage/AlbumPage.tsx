import React, { useEffect, useState } from "react";
import { makeStyles } from "@material-ui/core/styles";
import MenuIcon from "@material-ui/icons/Menu";
import { CssBaseline, AppBar, Toolbar, IconButton, createStyles, Theme, Typography } from "@material-ui/core";
import TopBar from "./TopBar";
import { Route, Switch } from "react-router-dom";
import { AlbumT } from "../../Interfaces";
import CreateAlbum from "./CreateAlbum";
import PhotoPage from "../Shared/PhotoPage";
import AbstractAlbumPage from "../Shared/AlbumGrid";
import AutoSizer from "react-virtualized-auto-sizer";
import SearchBar from "material-ui-search-bar";
import { createAlbum, getAlbums } from "../../API";
import AutocompleteSearchBar from "../Shared/SearchBar";

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

export default function AlbumPage(props: { handleDrawerToggle: () => void; drawerElement: any; searchByImageEnabled: boolean }) {
    const classes = useStyles();

    const [albums, setAlbums] = useState<AlbumT[]>([]);
    const [openCreateAlbum, setOpenCreateAlbum] = useState(false);
    const [showLoadingBar, setShowLoadingBar] = useState(true);

    const [showSearchBar, setShowSearchBar] = useState(false);
    const [searchBarText, setSearchBarText] = useState("");
    const [searchTerm, setSearchTerm] = useState("");
    const [autocompleteOptions, setAutocompleteOption] = useState<string[]>([]);

    const fetchAlbums = async () => {
        setShowLoadingBar(true);
        const resp = await getAlbums(searchTerm);
        if (resp.status === 200) {
            setAlbums(resp.data);
            setShowLoadingBar(false);
        } else {
            window.alert(await resp.data);
        }
    };

    useEffect(() => {
        fetchAlbums();
    }, [searchTerm]);

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

    const openAlbum = () => () => {};

    const heights = [searchTerm === "" || !searchTerm ? 0 : 40];

    const lines = [
        <Typography variant="h5" style={{ display: searchTerm === "" || !searchTerm ? "none" : "block" }}>
            Search results for {searchTerm}:
        </Typography>,
    ];

    return (
        <div>
            <Switch>
                <Route path="/albums/open">
                    <PhotoPage refresh={fetchAlbums} drawerElement={props.drawerElement} handleDrawerToggle={props.handleDrawerToggle} searchByImageEnabled={props.searchByImageEnabled} root="Album" />
                </Route>
                <Route path="/albums/">
                    <div className={classes.root}>
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
                                    buttonFunctions={topBarButtonFunctions}
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
