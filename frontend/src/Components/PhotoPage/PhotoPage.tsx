import React, { useEffect, useState } from "react";
import "./PhotoPage.css";
import { makeStyles } from "@material-ui/core/styles";
import MenuIcon from "@material-ui/icons/Menu";
import { CssBaseline, AppBar, Toolbar, IconButton, createStyles, Theme } from "@material-ui/core";
import TopBar from "./TopBar";
import { Route, Switch, useHistory } from "react-router-dom";
import ViewPage from "../ViewPage/ViewPage";
import axios from "axios";
import AddToAlbum from "../AlbumPage/AddToAlbum";
import qs from "qs";

function Photo(props: any) {
    const url = "http://localhost:4000/media/" + props.id;
    const padding = props.selected ? 35 : 0;
    const [vis, setVis] = useState(0);
    const opacity = props.anySelected() ? 255 : vis;

    const useStyles = makeStyles({
        photoDiv: {
            margin: 5,
            height: props.y,
            width: props.x,
            "align-items": "center",
            "justify-content": "center",
            display: "flex",
            background: "#aaaaaa33",
            position: "relative",
        },
        photoBox: { transition: "0.07s all  linear", position: "absolute", left: 15, top: 15, height: 20, width: 20, opacity: opacity },
    });

    const classes = useStyles();
    const history = useHistory();

    const onImageClick = () => {
        if (props.anySelected()) {
            props.click();
        } else {
            history.push(`/view/${props.id}`);
        }
    };

    return (
        <div className={classes.photoDiv} onMouseEnter={() => setVis(0.4)} onMouseLeave={() => setVis(0)}>
            <input className={classes.photoBox} readOnly={true} checked={props.selected} type="checkbox" onClick={props.click} />
            <div onClick={onImageClick}>
                <img alt={props.id} style={{ transition: "0.05s linear" }} src={url} height={props.y - padding} width={props.x - padding} />
            </div>
        </div>
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

export default function PhotoPage(props: any) {
    const classes = useStyles();
    const hiddenFileInput = React.useRef(null);

    const [photos, setPhotos] = useState<any[]>([]);
    const [albums, setAlbums] = useState<any[]>([]);
    const [selected, setSelected] = useState<string[]>([]);
    const [selectable, setSelectable] = useState(false);
    const [open, setOpen] = useState(false);

    const fetchPhotos = async () => {
        const resp = await axios.get("media/all");
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

    const cb = async (albums: any) => {
        const requestBody = {
            photos: selected,
            albums: albums,
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

    const height = 300.0;

    const makePhoto = (photo: any) => (
        <Photo
            key={photo.id}
            id={photo.id}
            x={(photo.width * height) / photo.height}
            y={height}
            click={clickHandler(photo.id)}
            selected={selected.includes(photo.id)}
            outZoom={0.9}
            anySelected={anySelected}
        />
    );

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
                            <div className="Main-Content">{photos.map((p) => makePhoto(p))}</div>
                        </main>
                    </div>
                </Route>
            </Switch>
            <AddToAlbum albums={albums} open={open} setOpen={setOpen} cb={cb}></AddToAlbum>
        </div>
    );
}
