import React, { useEffect, useMemo, useRef, useState } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import "./ViewPage.css";
import { useHistory } from "react-router-dom";
import { useTransition, animated } from "react-spring";
import TopLeftBar from "./TopLeftBar";
import {
    Chip,
    CircularProgress,
    ClickAwayListener,
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
    Paper,
    Switch,
    TextField,
    Theme,
    ThemeProvider,
    Tooltip,
    Typography,
    useMediaQuery,
    useTheme,
} from "@material-ui/core";
import { ChevronLeft, ChevronRight, Close, Label, PhotoOutlined, AddCircle, Map, Edit, Info, Warning } from "@material-ui/icons";
import clsx from "clsx";
import { PhotoT } from "../../Interfaces";
import { addLabel, baseURL, editMedia, getPhotoLabels, removeLabel } from "../../API";
import { Swiper, SwiperSlide } from "swiper/react";
import SwiperCore, { Virtual, Navigation } from "swiper";
import "swiper/swiper.min.css";
import moment from "moment";
import EditPropsDialog from "./EditPropsDialog";

import { MapContainer, TileLayer, Marker } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.webpack.css"; // Re-uses images from ~leaflet package
import "leaflet-defaulticon-compatibility";

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

export default function ViewPage(props: { photos: PhotoT[]; setViewId: (arg0: string) => void; buttonFunctions: any; topRightBar: (arg0: string, arg1: any) => React.ReactNode }) {
    const history = useHistory();
    const id = window.location.pathname.split("/").slice(-1)[0];
    const [opacityRight, setOpacityRight] = useState(0);
    const [opacityLeft, setOpacityLeft] = useState(0);
    const [drawerOpen, setDrawerOpen] = useState(localStorage.getItem("drawerOpen") === "true");
    const [editPropsOpen, setEditPropsOpen] = useState(false);
    const [labels, setLabels] = useState<string[] | "Loading">("Loading");
    const index = props.photos.findIndex((v: PhotoT) => v.id === id);
    const photo = props.photos[index];

    const [mapEnabled, setMapEnabled] = useState(localStorage.getItem("enableMap") === "true");

    useEffect(() => {
        props.setViewId(id);
    }, [id]);

    useEffect(() => {
        getLabels();
    }, [id]);

    const getLabels = async () => {
        const resp = await getPhotoLabels([id]);
        if (resp.status === 200) {
            setLabels(resp.data);
        } else {
            window.alert(await resp.data);
        }
    };

    const classes = useStyles(useTheme());

    const handleDrawerClose = () => {
        localStorage.setItem("drawerOpen", "false");
        setDrawerOpen(false);
    };

    const slideChange = (index: number) => {
        const photos = props.photos;
        const afterWithout = window.location.pathname.substr(0, window.location.pathname.lastIndexOf("/") + 1);
        const id = photos[index].id;
        history.replace(`${afterWithout}${id}`);
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
            if (props.photos.length === 1) history.goBack();
            else if (index === 0) {
                slideChange(1);
            } else {
                slideChange(index - 1);
            }
            await props.buttonFunctions.delete(id);
        },
        remove: async (id: string) => {
            if (props.photos.length === 1) history.goBack();
            else slideChange(index === 0 ? 1 : index - 1);
            await props.buttonFunctions.remove(id);
        },
        info: () => {
            localStorage.setItem("drawerOpen", drawerOpen ? "false" : "true");
            setDrawerOpen(!drawerOpen);
        },
    };

    const swiperRef = useRef<SwiperCore>(null);
    const prevRef = useRef<HTMLDivElement>(null);
    const nextRef = useRef<HTMLDivElement>(null);

    const hideArrows = useMediaQuery(theme.breakpoints.down("sm"));

    const editPropsCb = async (name: string, date: number) => {
        editMedia(id, name, date);
        props.photos[index].name = name;
        props.photos[index].date = date;
    };

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
                                easing: theme.transitions.easing.sharp,
                                duration: theme.transitions.duration.leavingScreen,
                            }),
                            height: `calc(100% - ${photo?.type === "video" ? 120 : 0}px)`,
                            pointerEvents: "none",
                        }}
                    >
                        <div
                            ref={prevRef}
                            className="leftIm"
                            onMouseEnter={mouseLeft}
                            onMouseMove={mouseLeft}
                            onMouseLeave={mouseCenter}
                            style={{
                                pointerEvents: "auto",
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
                            className="center"
                            onClick={(ev) => {
                                history.goBack();
                                ev.stopPropagation();
                            }}
                            onMouseEnter={mouseCenter}
                            style={{ pointerEvents: photo?.type === "video" ? "none" : "stroke" }}
                        ></div>
                        <div
                            ref={nextRef}
                            className="rightIm"
                            onMouseEnter={mouseRight}
                            onMouseMove={mouseRight}
                            onMouseLeave={mouseCenter}
                            style={{
                                pointerEvents: "auto",
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
                    <Carousel slideChange={slideChange} index={index} photos={props.photos} open={drawerOpen} swiperRef={swiperRef} prevRef={prevRef} nextRef={nextRef} hideArrows={hideArrows} />
                    <div
                        className="rootTop"
                        style={{
                            display: "flex",
                            justifyContent: "space-between",
                            width: `calc(100% - ${drawerOpen ? drawerWidth : 0}px)`,
                            transition: theme.transitions.create("width", {
                                easing: theme.transitions.easing.sharp,
                                duration: theme.transitions.duration.leavingScreen,
                            }),
                        }}
                    >
                        <TopLeftBar />
                        {props.topRightBar(id, modifiedButtonFunctions)}
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
                    <ListItem>
                        <ListItemIcon>
                            <PhotoOutlined />
                        </ListItemIcon>
                        <ListItemText primary={photo ? photo.name : ""} secondary={photo ? moment.unix(photo.date).format("DD. MMM YYYY, HH:mm:ss") : ""} />
                        <IconButton onClick={() => setEditPropsOpen(true)}>
                            <Edit></Edit>
                        </IconButton>
                    </ListItem>
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
                                                <LabelChip id={id} label={label} removeLabel={removeLabel} getLabels={getLabels} />
                                            </li>
                                        );
                                    })}
                                    <LabelInputChip addLabel={addLabel} getLabels={getLabels} id={id} />
                                </>
                            )}
                        </ul>
                    </ListItem>
                    <ListItem>
                        {photo && photo.coordx && photo.coordy && (
                            <>
                                <ListItemIcon>
                                    <Map />
                                </ListItemIcon>
                                <ListItemText
                                    primary={
                                        <>
                                            Map
                                            <Switch
                                                checked={mapEnabled}
                                                onChange={() => {
                                                    localStorage.setItem("enableMap", mapEnabled ? "false" : "true");
                                                    setMapEnabled(!mapEnabled);
                                                }}
                                                color="primary"
                                            />
                                        </>
                                    }
                                />
                                <IconButton>
                                    <Tooltip title="The map has to be requested from an external source (openstreetmap.org).">
                                        <Warning></Warning>
                                    </Tooltip>
                                </IconButton>
                            </>
                        )}
                    </ListItem>
                    <ListItem>
                        {mapEnabled && photo && photo.coordx && photo.coordy && (
                            <MapContainer center={[photo.coordx, photo.coordy]} zoom={13} scrollWheelZoom={false} style={{ height: 200, width: "100%" }} key={photo.id}>
                                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                                <Marker position={[photo.coordx, photo.coordy]}></Marker>
                            </MapContainer>
                        )}
                    </ListItem>
                </List>
            </Drawer>
            <EditPropsDialog open={editPropsOpen} setOpen={setEditPropsOpen} cb={editPropsCb} photo={props.photos[index]} />
        </div>
    );
}

function LabelChip(props: any) {
    const classes = useStyles(useTheme());
    const [deleted, setDeleted] = useState(false);

    return (
        <Chip
            label={props.label}
            onDelete={async () => {
                setDeleted(true);
                await props.removeLabel(props.id, props.label);
                props.getLabels();
            }}
            className={classes.chip}
            deleteIcon={deleted ? <CircularProgress style={{ height: 20, width: 20, padding: 1.5, marginRight: 7 }} /> : undefined}
        />
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

function makeSlides(photos: PhotoT[]): any[] {
    const f = photos.map((photo: PhotoT, index: number) => {
        return (
            <SwiperSlide key={photo.id} virtualIndex={index} style={{ alignSelf: "center", justifySelf: "center" }}>
                {photo.type === "photo" ? (
                    <img
                        className="display"
                        alt={photo.id}
                        style={{
                            objectFit: "scale-down",
                            height: "100vh",
                            width: `100%`,
                        }}
                        src={baseURL + "/media/" + photo.id}
                    />
                ) : (
                    <video
                        className="display"
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
    const slide = useMemo(() => makeSlides(props.photos.slice(Math.max(0, props.index - RANGE), Math.min(props.index + RANGE, props.photos.length))), [props.photos, props.open, key]);

    useEffect(() => {
        setIndex(props.index);
        setKey(key + 1);
    }, [props.photos, props.open, key2]); //add props.hideArrows if you want swiping to be disabled when screen size changes

    return props.photos.length === 0 ? null : (
        <Swiper
            allowTouchMove={props.hideArrows}
            key={key}
            className="imageHolder"
            spaceBetween={50}
            slidesPerView={1}
            virtual
            style={{
                width: `calc(100vw - ${props.open ? drawerWidth : 0}px)`,
                zIndex: -1,
                position: "absolute",
            }}
            navigation={{
                prevEl: props.prevRef.current ? props.prevRef.current : undefined,
                nextEl: props.nextRef.current ? props.nextRef.current : undefined,
            }}
            initialSlide={Math.min(RANGE, index)}
            onInit={(swiper) => {
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-ignore
                // eslint-disable-next-line no-param-reassign
                swiper.params.navigation.prevEl = props.prevRef.current;
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-ignore
                // eslint-disable-next-line no-param-reassign
                swiper.params.navigation.nextEl = props.nextRef.current;
                swiper.navigation.update();
            }}
            onSlideChange={(e) => {
                props.slideChange(e.activeIndex + Math.max(0, index - RANGE));
                e.slides.forEach((el) => {
                    if (el.firstChild instanceof HTMLVideoElement) {
                        el.firstChild.pause();
                        el.firstChild.currentTime = 0;
                    }
                });
            }}
            onTransitionEnd={(e) => {
                console.log(e.activeIndex);
                console.log(index);
                if ((e.activeIndex == 0 && index > RANGE) || e.activeIndex - Math.min(index, RANGE) == RANGE - 1) {
                    setKey2(key2 + 1);
                }
            }}
        >
            {slide}
        </Swiper>
    );
};
