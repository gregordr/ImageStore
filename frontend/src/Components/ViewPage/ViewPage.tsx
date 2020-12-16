import React, { useEffect, useState } from "react";
import "./ViewPage.css";
import { useHistory } from "react-router-dom";
import { useTransition, animated } from "react-spring";
import TopLeftBar from "./TopLeftBar";
import {
    Avatar,
    createMuiTheme,
    createStyles,
    CssBaseline,
    Divider,
    Drawer,
    IconButton,
    List,
    ListItem,
    ListItemAvatar,
    ListItemIcon,
    ListItemText,
    makeStyles,
    Theme,
    ThemeProvider,
    Typography,
    useMediaQuery,
    useTheme,
} from "@material-ui/core";
import { ChevronLeft, ChevronRight, Close, Inbox, Mail, PhotoOutlined } from "@material-ui/icons";
import clsx from "clsx";
import { PhotoT } from "../../Interfaces";
import { useSwipeable } from "react-swipeable";

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
    })
);

export default function ViewPage(props: any) {
    const history = useHistory();
    const [id, setId] = useState(window.location.pathname.split("/").slice(-1)[0]);
    const [dir, setDir] = useState(0);
    const [opacityRight, setOpacityRight] = useState(0);
    const [opacityLeft, setOpacityLeft] = useState(0);
    const [open, setOpen] = useState(false);

    useEffect(() => {
        props.setViewId(id);
    }, [id, props.setViewed]);

    const index = props.photos.findIndex((v: PhotoT) => v.id === id);
    const photo = props.photos[index];

    const classes = useStyles(useTheme());

    const handleDrawerClose = () => {
        setOpen(false);
    };

    const url = "http://localhost:4000/media/" + id;

    const canGo = (dir: number) => {
        const photos = props.photos;
        let ind = photos.findIndex((v: any) => v.id === id);
        ind += dir;
        return ind >= 0 && ind < photos.length;
    };

    const go = (dir: number) => () => {
        const photos = props.photos;
        let ind = photos.findIndex((v: any) => v.id === id);
        if (!canGo(dir * 2)) {
            if (dir < 0) setOpacityLeft(0);
            else setOpacityRight(0);
        }
        if (canGo(dir)) {
            setDir(50 * dir);
            ind += dir;
            const afterWithout = window.location.pathname.substr(0, window.location.pathname.lastIndexOf("/") + 1);
            history.replace(`${afterWithout}${photos[ind].id}`);
            setId(photos[ind].id);
        }
    };

    const transitions = useTransition(url, (p) => p, {
        from: { opacity: 0, transform: `translate3d(${dir}%,0,0)` },
        enter: { opacity: 1, transform: "translate3d(0%,0,0)" },
        leave: { opacity: 0, transform: "translate3d(-50%,0,0)" },
    });

    const mouseRight = () => {
        if (canGo(1)) setOpacityRight(100);
        else setOpacityRight(0);
        setOpacityLeft(0);
    };

    const mouseLeft = () => {
        if (canGo(-1)) setOpacityLeft(100);
        else setOpacityLeft(0);
        setOpacityRight(0);
    };
    const mouseCenter = () => {
        setOpacityLeft(0);
        setOpacityRight(0);
    };

    const modifiedButtonFunctions = {
        ...props.buttonFunctions,
        delete: async (id: string) => {
            if (canGo(-1)) go(-1)();
            else if (canGo(1)) go(1)();
            else history.goBack();

            await props.buttonFunctions.delete(id);
        },
        remove: async (id: string) => {
            if (canGo(-1)) go(-1)();
            else if (canGo(1)) go(1)();
            else history.goBack();

            await props.buttonFunctions.remove(id);
        },
        info: () => {
            setOpen(!open);
        },
    };

    const handlers = useSwipeable({
        onSwipedLeft: (eventData) => go(1)(),
        onSwipedRight: (eventData) => go(-1)(),
    });

    const hideArrows = useMediaQuery(theme.breakpoints.down("sm"));

    return (
        <div className={classes.root}>
            <CssBaseline />
            <main
                className={clsx(classes.content, {
                    [classes.contentShift]: open,
                })}
            >
                <ThemeProvider theme={theme}>
                    {transitions.map(({ item, props, key }) => (
                        <div key={key} className="imageHolder" {...handlers}>
                            <animated.div style={{ ...props, alignSelf: "center", justifySelf: "center" }}>
                                <img
                                    className="display"
                                    alt={id}
                                    style={{
                                        objectFit: "scale-down",
                                        height: "100vh",
                                        width: `calc(100% - ${open ? drawerWidth : 0}px)`,
                                        transition: theme.transitions.create("width", {
                                            easing: theme.transitions.easing.sharp,
                                            duration: theme.transitions.duration.leavingScreen,
                                        }),
                                    }}
                                    src={item}
                                />
                            </animated.div>
                        </div>
                    ))}

                    <div
                        className="root"
                        style={{
                            display: `${hideArrows ? "none" : "grid"}`,
                            width: `calc(100% - ${open ? drawerWidth : 0}px)`,
                            transition: theme.transitions.create("width", {
                                easing: theme.transitions.easing.sharp,
                                duration: theme.transitions.duration.leavingScreen,
                            }),
                        }}
                    >
                        <div className="leftIm" onMouseEnter={mouseLeft} onClick={go(-1)}>
                            <IconButton
                                style={{
                                    transition: "0.01s linear",
                                    opacity: opacityLeft,
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
                        <div className="center" onClick={() => history.goBack()} onMouseEnter={mouseCenter}></div>
                        <div className="rightIm" onMouseEnter={mouseRight} onClick={go(1)}>
                            <IconButton
                                style={{
                                    transition: "0.01s linear",
                                    opacity: opacityRight,
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

                    <div className="rootTop" style={{ display: "flex", justifyContent: "space-between" }}>
                        <TopLeftBar />
                        {props.topRightBar(id, modifiedButtonFunctions)}
                    </div>
                </ThemeProvider>
            </main>
            <Drawer
                className={classes.drawer}
                variant="persistent"
                anchor="right"
                open={open}
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
                        <ListItemText primary={photo ? photo.name : ""} secondary="Useful info" />
                    </ListItem>
                </List>
            </Drawer>
        </div>
    );
}
