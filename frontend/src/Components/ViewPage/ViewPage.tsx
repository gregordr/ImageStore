import React, { Ref, useEffect, useMemo, useRef, useState } from "react";
import "./ViewPage.css";
import { useHistory, useLocation } from "react-router-dom";
import TopLeftBar from "./TopLeftBar";
import {
    Button,
    Chip,
    CircularProgress,
    createMuiTheme,
    createStyles,
    CssBaseline,
    Divider,
    Drawer,
    IconButton,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    makeStyles,
    Switch,
    TextField,
    Theme,
    ThemeProvider,
    Tooltip,
    Typography,
    useMediaQuery,
    useTheme,
} from "@material-ui/core";
import { ChevronLeft, ChevronRight, Close, Label, PhotoOutlined, AddCircle, Map, Edit, Warning, Face, PhotoAlbum } from "@material-ui/icons";
import clsx from "clsx";
import { AlbumT, PhotoT } from "../../Interfaces";
import { addLabel, baseURL, Box, editMedia, getBoxes, getPhotoLabels, removeLabel } from "../../API";
import { Swiper, SwiperSlide } from "swiper/react";
import SwiperCore, { Virtual, Navigation } from "swiper";
import "swiper/swiper.min.css";
import moment from "moment";
import EditPropsDialog from "./EditPropsDialog";
import EditLocationDialog from "./EditLocationDialog";

import { MapContainer, TileLayer, Marker } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.webpack.css"; // Re-uses images from ~leaflet package
import "leaflet-defaulticon-compatibility";
import { TransformComponent, TransformWrapper } from "react-zoom-pan-pinch";
import OpenInDialog from "./OpenInDialog";

SwiperCore.use([Virtual, Navigation]);

const theme = createMuiTheme({
    palette: {
        primary: {
            main: "#ffffff",
            dark: "#ffffff",
            light: "#ffffff",
        },
        secondary: {
            main: "#ff0000",
        },
    },
});

const drawerWidth = 340;

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        root: {
            display: "flex",
        },
        drawer: {
            width: drawerWidth,
            flexShrink: 0,
        },
        drawerPaper: {
            width: drawerWidth,
        },
        drawerHeader: {
            display: "flex",
            alignItems: "center",
            padding: theme.spacing(0, 1),
            // necessary for content to be below app bar
            justifyContent: "space-between",
            ...theme.mixins.toolbar,
        },
        content: {
            flexGrow: 1,
            transition: theme.transitions.create("margin", {
                easing: theme.transitions.easing.sharp,
                duration: theme.transitions.duration.leavingScreen,
            }),
            marginRight: -0,
        },
        contentShift: {
            transition: theme.transitions.create("margin", {
                easing: theme.transitions.easing.easeOut,
                duration: theme.transitions.duration.enteringScreen,
            }),
            marginRight: drawerWidth,
        },
        onlyMobile: {
            [theme.breakpoints.up("md")]: {
                display: "none",
            },
        },
        notMobile: {
            [theme.breakpoints.down("sm")]: {
                display: "none",
            },
        },
        chip: {
            margin: theme.spacing(0.5),
        },
    })
);

export default function ViewPage(props: { photos: PhotoT[]; setViewId: (arg0: string) => void; buttonFunctions: any; topRightBar: (arg0: string, arg1: any, searchByImageEnabled: boolean) => React.ReactNode; search: (term: string) => void; searchByImageEnabled: boolean; searchByFace: (id: string, box: Box) => void }) {
    const history = useHistory();
    const id = window.location.pathname.split("/").slice(-1)[0];
    const [opacityRight, setOpacityRight] = useState(0);
    const [opacityLeft, setOpacityLeft] = useState(0);
    const [drawerOpen, setDrawerOpen] = useState(localStorage.getItem("drawerOpen") === "true");
    const [editPropsOpen, setEditPropsOpen] = useState(false);
    const [editLocationOpen, setEditLocationOpen] = useState(false);
    const [openInOpen, setOpenInOpen] = useState(false);
    const [labels, setLabels] = useState<string[] | "Loading">("Loading");
    const [faces, setFaces] = useState<[{ boundingbox: Box }] | "Loading">("Loading");
    const index = props.photos.findIndex((v: PhotoT) => v.id === id);
    const photo = props.photos[index];
    const { search: queryUrl } = useLocation();

    const showCursor = useRef(false)
    showCursor.current = Boolean((opacityLeft && index !== 0) || (opacityRight && index !== props.photos.length - 1))

    const [mapEnabled, setMapEnabled] = useState(localStorage.getItem("enableMap") === "true");

    useEffect(() => {
        props.setViewId(id);
    }, [id]);

    useEffect(() => {
        setLabels("Loading")
        getLabels();
    }, [id]);

    useEffect(() => {
        setFaces("Loading")
        getFaces();
    }, [id]);

    const getLabels = async () => {
        const resp = await getPhotoLabels([id]);
        if (resp.status === 200) {
            setLabels(resp.data);
        } else {
            window.alert(await resp.data);
        }
    };

    const getFaces = async () => {
        const faces = await getBoxes(id);
        setFaces(faces);
    };

    const classes = useStyles(useTheme());

    const handleDrawerClose = () => {
        localStorage.setItem("drawerOpen", "false");
        setDrawerOpen(false);
    };

    const searchForLabel = (term: string) => {
        history.push(history.location.pathname.split("/").splice(0, history.location.pathname.split("/").length - 2).join("/") + "/" + queryUrl)
        props.search(term)
    }

    const slideChange = (index: number) => {
        const photos = props.photos;
        const afterWithout = window.location.pathname.substr(0, window.location.pathname.lastIndexOf("/") + 1);
        const id = photos[index].id;
        history.replace(`${afterWithout}${id}${queryUrl}`);
    };

    const mouseRight = () => {
        setOpacityRight(100);
        setOpacityLeft(0);
    };

    const mouseLeft = () => {
        setOpacityLeft(100);
        setOpacityRight(0);
    };
    const mouseCenter = () => {
        setOpacityLeft(0);
        setOpacityRight(0);
    };

    const modifiedButtonFunctions = {
        ...props.buttonFunctions,
        delete: async (id: string) => {
            if (props.photos.length === 1) history.replace((history.location.pathname.split("/").splice(0, history.location.pathname.split("/").length - 2).join("/") || "/") + queryUrl);
            else if (index === 0) {
                slideChange(1);
            } else {
                slideChange(index - 1);
            }
            await props.buttonFunctions.delete(id);
        },
        remove: async (id: string) => {
            if (props.photos.length === 1) history.replace((history.location.pathname.split("/").splice(0, history.location.pathname.split("/").length - 2).join("/") || "/") + queryUrl);
            else slideChange(index === 0 ? 1 : index - 1);
            await props.buttonFunctions.remove(id);
        },
        info: () => {
            localStorage.setItem("drawerOpen", drawerOpen ? "false" : "true");
            setDrawerOpen(!drawerOpen);
        },
    };

    const prevRef = useRef<HTMLDivElement>(null);
    const nextRef = useRef<HTMLDivElement>(null);

    const hideArrows = useMediaQuery(theme.breakpoints.down("sm"));

    const editPropsCb = async (name: string, date: number) => {
        editMedia(id, name, date, props.photos[index].coordx, props.photos[index].coordy);
        props.photos[index].name = name;
        props.photos[index].date = date;
    };

    const editLocationCb = async (x?: number, y?: number) => {
        editMedia(id, props.photos[index].name, props.photos[index].date, x, y);
        props.photos[index].coordx = x;
        props.photos[index].coordy = y;
    };

    const openInCb = async (album: "default" | string) => {
        history.push(history.location.pathname.split("/").splice(0, 1)[0] + (album === "default" ? "" : "/albums/open/" + album), { jumpTo: photo.id })
    };

    const goBack = () => {
        history.replace((history.location.pathname.split("/").splice(0, history.location.pathname.split("/").length - 2).join("/") || "/") + queryUrl)
    }

    return (
        <div className={classes.root}>
            <CssBaseline />
            <main
                className={clsx(classes.content, {
                    [classes.contentShift]: drawerOpen,
                })}
            >
                <ThemeProvider theme={theme}>
                    <div
                        className="root"
                        style={{
                            display: `${hideArrows ? "none" : "grid"}`,
                            width: `calc(100% - ${drawerOpen ? drawerWidth : 0}px)`,
                            transition: theme.transitions.create("width", {
                                duration: theme.transitions.duration.leavingScreen,
                            }),
                            height: `calc(100% - ${photo?.type === "video" ? 120 : 0}px)`,
                            pointerEvents: "none",
                        }}
                    >
                        <div
                            ref={prevRef}
                            className="leftIm"
                            style={{
                                pointerEvents: "none",
                            }}

                        >
                            <IconButton
                                style={{
                                    transition: "0.01s linear",
                                    opacity: index === 0 ? 0 : opacityLeft,
                                    backgroundColor: "#222222",
                                    alignSelf: "center",
                                    justifySelf: "left",
                                    position: "absolute",
                                    marginLeft: "20px",
                                    height: "64px",
                                    width: "64px",
                                }}
                                className="IconButton"
                                color="primary"
                                aria-label="left"
                            >
                                <ChevronLeft style={{ height: "64px", width: "64px" }} />
                            </IconButton>
                        </div>
                        <div
                            ref={nextRef}
                            className="rightIm"
                            style={{
                                pointerEvents: "none",
                            }}
                        >
                            <IconButton
                                style={{
                                    transition: "0.01s linear",
                                    opacity: index === props.photos.length - 1 ? 0 : opacityRight,
                                    backgroundColor: "#222222",
                                    alignSelf: "center",
                                    justifySelf: "right",
                                    position: "absolute",
                                    marginRight: "20px",
                                    height: "64px",
                                    width: "64px",
                                }}
                                className="IconButton"
                                color="primary"
                                aria-label="left"
                            >
                                <ChevronRight style={{ height: "64px", width: "64px" }} />
                            </IconButton>
                        </div>
                    </div>
                    <Carousel slideChange={slideChange} index={index} photos={props.photos} open={drawerOpen} prevRef={prevRef} nextRef={nextRef} hideArrows={hideArrows} goBack={goBack} mouseLeft={mouseLeft} mouseRight={mouseRight} mouseCenter={mouseCenter} showCursor={showCursor}
                    />
                    <div
                        className="rootTop"
                        style={{
                            display: "flex",
                            justifyContent: "space-between",
                            width: `calc(100% - ${drawerOpen ? drawerWidth : 0}px)`,
                            transition: theme.transitions.create("width", {
                                duration: theme.transitions.duration.leavingScreen,
                            }),
                        }}
                    >
                        <TopLeftBar />
                        {props.topRightBar(id, modifiedButtonFunctions, props.searchByImageEnabled)}
                    </div>
                </ThemeProvider>
            </main>
            <Drawer
                className={classes.drawer}
                variant="persistent"
                anchor="right"
                open={drawerOpen}
                classes={{
                    paper: classes.drawerPaper,
                }}
            >
                <div className={classes.drawerHeader}>
                    <Typography variant="h5"> Info</Typography>
                    <IconButton style={{ justifySelf: "end" }} onClick={handleDrawerClose}>
                        <Close />
                    </IconButton>
                </div>
                <Divider></Divider>

                <List>
                    {/* General info */}
                    <ListItem>
                        <ListItemIcon>
                            <PhotoOutlined />
                        </ListItemIcon>
                        <ListItemText primary={photo ? photo.name : ""} secondary={photo ? moment.unix(photo.date).format("DD. MMM YYYY, HH:mm:ss") : ""} />
                        <IconButton onClick={() => setEditPropsOpen(true)}>
                            <Edit></Edit>
                        </IconButton>
                    </ListItem>

                    {/* Labels */}
                    <ListItem>
                        <ListItemIcon>
                            <Label />
                        </ListItemIcon>
                        <ListItemText primary="Labels" secondary=" " />
                    </ListItem>
                    <ListItem>
                        <ul
                            style={{
                                display: "flex",
                                justifyContent: "left",
                                flexWrap: "wrap",
                                listStyle: "none",
                                padding: 0,
                                margin: 0,
                                marginLeft: 5,
                                marginTop: -15,
                            }}
                        >
                            {labels === "Loading" ? (
                                <CircularProgress size={20} style={{ margin: 10 }} />
                            ) : (
                                <>
                                    {labels.map((label) => {
                                        return (
                                            <li key={label}>
                                                <LabelChip id={id} label={label} getLabels={getLabels} search={searchForLabel} />
                                            </li>
                                        );
                                    })}
                                    <LabelInputChip addLabel={addLabel} getLabels={getLabels} id={id} />
                                </>
                            )}
                        </ul>
                    </ListItem>

                    {/* Faces */}
                    <ListItem>
                        <ListItemIcon>
                            <Face />
                        </ListItemIcon>
                        <ListItemText primary="Faces" secondary=" " />
                    </ListItem>
                    <ListItem>
                        <ul
                            style={{
                                display: "flex",
                                justifyContent: "left",
                                flexWrap: "wrap",
                                listStyle: "none",
                                padding: 0,
                                margin: 0,
                                marginLeft: 5,
                                marginTop: -15,
                            }}
                        >
                            {faces === "Loading" || !photo ? (
                                <CircularProgress size={20} style={{ margin: 10 }} />
                            ) : (
                                <>
                                    {faces.map((face) => {
                                        return (
                                            <li key={face.boundingbox.toJSON()}>
                                                <FaceCrop id={id} photo={photo} face={face} searchByFace={props.searchByFace} getFaces={getFaces} search={searchForLabel} />
                                            </li>
                                        );
                                    })}
                                </>
                            )}
                        </ul>
                    </ListItem>

                    {/* Map */}
                    <ListItem>
                        <ListItemIcon>
                            <Map />
                        </ListItemIcon>
                        <ListItemText
                            primary={
                                <>
                                    Map
                                    {photo && photo.coordx && photo.coordy && (
                                        <Switch
                                            checked={mapEnabled}
                                            onChange={() => {
                                                localStorage.setItem("enableMap", mapEnabled ? "false" : "true");
                                                setMapEnabled(!mapEnabled);
                                            }}
                                            color="primary"
                                        />
                                    )}
                                </>
                            }
                        />
                        <IconButton>
                            <Tooltip title="The map has to be requested from an external source (openstreetmap.org).">
                                <Warning></Warning>
                            </Tooltip>
                        </IconButton>
                        <IconButton onClick={() => setEditLocationOpen(true)}>
                            <Tooltip title="Edit location">
                                <Edit></Edit>
                            </Tooltip>
                        </IconButton>
                    </ListItem>
                    <ListItem>
                        {mapEnabled && photo && photo.coordx && photo.coordy && (
                            <MapContainer
                                attributionControl={false}
                                center={[photo.coordx, photo.coordy]}
                                zoom={13}
                                scrollWheelZoom={false}
                                style={{ height: 200, width: "100%" }}
                                key={photo.id + photo.coordx + photo.coordy}
                            >
                                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                                <Marker position={[photo.coordx, photo.coordy]}></Marker>
                            </MapContainer>
                        )}
                    </ListItem>

                    {/* Open in */}
                    <ListItem>
                        <ListItemIcon>
                            <PhotoAlbum />
                        </ListItemIcon>
                        <ListItemText primary={"See in album"} />
                        <Tooltip title="Open in an album">
                            <Button variant="outlined" onClick={() => setOpenInOpen(true)}>
                                Open
                            </Button>
                        </Tooltip>
                    </ListItem>

                </List>
            </Drawer>
            <EditPropsDialog open={editPropsOpen} setOpen={setEditPropsOpen} cb={editPropsCb} photo={props.photos[index]} />
            <EditLocationDialog open={editLocationOpen} setOpen={setEditLocationOpen} cb={editLocationCb} photo={props.photos[index]} />
            <OpenInDialog open={openInOpen} setOpen={setOpenInOpen} cb={openInCb} photo={props.photos[index]} />
        </div>
    );
}

function LabelChip(props: any) {
    const classes = useStyles(useTheme());
    const [deleted, setDeleted] = useState(false);

    return (
        <Chip
            label={props.label}
            onClick={() => props.search(props.label)}
            onDelete={async () => {
                setDeleted(true);
                await removeLabel(props.id, props.label);
                props.getLabels();
            }}

            className={classes.chip}
            deleteIcon={deleted ? <CircularProgress style={{ height: 20, width: 20, padding: 1.5, marginRight: 7 }} /> : undefined}
        />
    );
}

function FaceCrop(props: any) {
    const box: Box = props.face.boundingbox
    const { x1: x2, x2: x1, y1: y2, y2: y1 } = box

    const xcenter = x1 + (x2 - x1) / 2
    const ycenter = y1 + (y2 - y1) / 2

    const scale = Math.min(75 / (x2 - x1), 75 / (y2 - y1))

    const history = useHistory()

    return (
        <div
            onClick={async () => {
                props.searchByFace(props.id, box);
                history.push(history.location.pathname.split("/").splice(0, history.location.pathname.split("/").length - 2).join("/"))
            }}
            style={{
                cursor: 'pointer',
                margin: 2,
                position: "relative",
                overflow: "hidden",
                width: "75px",
                height: "75px",
            }}
        >
            <img
                style={{
                    position: "absolute",
                    top: -ycenter * scale + 75 / 2,
                    left: -xcenter * scale + 75 / 2,
                    transform: `scale(${scale})`,
                    width: props.photo.width,
                    height: props.photo.height,
                    transformOrigin: "top left",
                    zIndex: -1
                }}
                src={baseURL + "/media/" + props.id} />
        </div>
    );
}

function LabelInputChip(props: any) {
    const classes = useStyles(useTheme());
    const [value, setValue] = useState("");
    const [added, setAdded] = useState(false);

    const handleAdd = async () => {
        setAdded(true);
        await props.addLabel([props.id], [value]);
        setValue("");
        setAdded(false);
        props.getLabels();
    };

    return (
        <Chip
            style={{ width: 120 }}
            label={
                <TextField
                    style={{ height: 25, marginBottom: 5, marginLeft: 5 }}
                    value={value}
                    onChange={(event) => setValue(event.target.value)}
                    onKeyPress={(ev) => {
                        if (ev.key === "Enter") {
                            handleAdd();
                            ev.preventDefault();
                        }
                    }}
                />
            }
            onDelete={handleAdd}
            className={classes.chip}
            deleteIcon={added ? <CircularProgress style={{ height: 20, width: 20, padding: 1.5, marginRight: 7 }} /> : <AddCircle style={{ transform: "rotate(0deg)" }} />}
        />
    );
}

function makeSlides(photos: PhotoT[], swiperRef: React.MutableRefObject<SwiperCore | undefined>, goBack: () => void, mouseLeft: () => void, mouseCenter: () => void, mouseRight: () => void, zoomedRef: React.MutableRefObject<number>): any[] {
    const f = photos.map((photo: PhotoT, index: number) => {
        return (
            <SwiperSlide
                key={photo.id}
                virtualIndex={index}
                style={{
                    alignSelf: "center", justifySelf: "center"
                }}
                onClick={(e) => {
                    if (zoomedRef.current !== 1) return
                    const segment = e.currentTarget.clientWidth / 3
                    if (e.clientX > segment * 2)
                        swiperRef.current?.slideNext()
                    else if (e.clientX < segment)
                        swiperRef.current?.slidePrev()
                    else {
                        if (photo.type === "photo")
                            goBack()
                        else
                            return
                    }
                    e.preventDefault();
                }}

                onMouseEnter={(e) => {
                    if (zoomedRef.current !== 1) return
                    const segment = e.currentTarget.clientWidth / 3
                    if (e.clientX > segment * 2)
                        mouseRight()
                    else if (e.clientX < segment)
                        mouseLeft()
                    else
                        mouseCenter()
                }}

                onMouseMove={(e) => {
                    if (zoomedRef.current !== 1) return
                    const segment = e.currentTarget.clientWidth / 3
                    if (e.clientX > segment * 2)
                        mouseRight()
                    else if (e.clientX < segment)
                        mouseLeft()
                    else
                        mouseCenter()
                }}

                onMouseLeave={(e) => {
                    if (zoomedRef.current !== 1) return
                    const segment = e.currentTarget.clientWidth / 3
                    if (e.clientX > segment * 2)
                        mouseCenter()
                    else if (e.clientX < segment)
                        mouseCenter()
                }}
            >
                {photo.type === "photo" ? (
                    <TransformWrapper
                        initialScale={1}
                        panning={{ disabled: zoomedRef.current === 1 }}
                        doubleClick={{ mode: "reset" }}
                    >
                        {({ zoomIn, zoomOut, resetTransform, ...rest }) => {

                            if (swiperRef.current?.activeIndex === index) {
                                zoomedRef.current = rest.state.scale;
                                if (rest.state.scale !== 1) mouseCenter()

                                rest.instance.props.panning!.disabled = rest.state.scale === 1
                            }

                            return (
                                <TransformComponent wrapperStyle={{ width: `100%` }} contentStyle={{ width: `100%` }}>
                                    <img
                                        alt={photo.id}
                                        src={baseURL + "/media/" + photo.id}
                                        style={{
                                            objectFit: "scale-down",
                                            height: "100vh",
                                            width: `100%`,
                                        }}
                                    />
                                </TransformComponent>
                            )

                        }}
                    </TransformWrapper>
                ) : (
                    <video
                        style={{
                            objectFit: "scale-down",
                            height: "100vh",
                            width: `100%`,
                        }}
                        controls
                    >
                        <source src={baseURL + "/media/" + photo.id} type="video/mp4" />
                    </video>
                )}
            </SwiperSlide>
        );
    });
    return f;
}

const Carousel = (props: any) => {
    const RANGE = 100;
    const [key, setKey] = useState(1);
    const [key2, setKey2] = useState(1);
    const [index, setIndex] = useState(props.index);
    const swiperRef = useRef<SwiperCore>()

    const zoomedRef = useRef(1)
    const slide = useMemo(() => makeSlides(props.photos.slice(Math.max(0, props.index - RANGE), Math.min(props.index + RANGE, props.photos.length)), swiperRef, props.goBack, props.mouseLeft, props.mouseCenter, props.mouseRight, zoomedRef), [props.photos, props.open, key]);

    useEffect(() => {
        setIndex(props.index);
        setKey(key + 1);
    }, [props.photos, key2]); //add props.hideArrows if you want swiping to be disabled when screen size changes

    return props.photos.length === 0 ? null : (
        <Swiper
            allowTouchMove={props.hideArrows}
            key={key}
            spaceBetween={50}
            slidesPerView={1}
            virtual

            style={{
                cursor: props.showCursor.current ? "pointer" : "auto",
                position: "absolute",
                display: "flex",
                backgroundColor: "black",
                height: "100%",
                width: `calc(100vw - ${props.open ? drawerWidth : 0}px)`,
                zIndex: -1,
            }}
            initialSlide={Math.min(RANGE, index)}
            onInit={(swiper) => {
                swiperRef.current = swiper
            }}
            onSlideChange={(e) => {
                props.slideChange(e.activeIndex + Math.max(0, index - RANGE));
                e.slides.forEach((el) => {
                    if (el.firstChild instanceof HTMLVideoElement) {
                        el.firstChild.pause();
                        el.firstChild.currentTime = 0;
                    }
                });
                zoomedRef.current = 1
            }}
            onTransitionEnd={(e) => {
                if ((e.activeIndex == 0 && index > RANGE) || e.activeIndex - Math.min(index, RANGE) == RANGE - 1) {
                    setKey2(key2 + 1);
                }
                zoomedRef.current = 1
            }}
            resizeObserver={true}
        >
            {slide}
        </Swiper>
    );
};
