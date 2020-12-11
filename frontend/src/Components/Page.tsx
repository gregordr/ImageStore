import React, { useState } from "react";
import { Divider, Drawer, Hidden, List, ListItem, ListItemIcon, ListItemText, Snackbar, IconButton, Slide} from "@material-ui/core";
import { makeStyles, useTheme, Theme, createStyles } from "@material-ui/core/styles";
import PhotoPage from "./PhotoPage/PhotoPage";
import { Photo, PhotoAlbum, Close } from "@material-ui/icons";
import { Switch, Route, useHistory, useLocation } from "react-router-dom";
import AlbumPage from "./AlbumPage/AlbumPage";
import { Snack } from "../Interfaces";
import { Alert, AlertTitle } from "@material-ui/lab";

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
            [theme.breakpoints.up("sm")]: {
                width: `calc(100% - ${drawerWidth}px)`,
                marginLeft: drawerWidth,
                background: "white",
            },
        },
        menuButton: {
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

export default function ResponsiveDrawer({ window }: any) {
    const classes = useStyles();
    const theme = useTheme();
    const [mobileOpen, setMobileOpen] = useState(false);
    const [snack, setSnack] = useState<Snack>({ open: false, severity: "info", title: "", body: "", action: null, autoHideDuration: null });

    const handleDrawerToggle = () => {
        setMobileOpen(!mobileOpen);
    };

    const closeSnack = (event?: React.SyntheticEvent, reason?: string) => {
        if (reason === "clickaway") return;

        setSnack({
            open: false,
            severity: snack.severity,
            title: snack.title,
            body: snack.body,
            action: snack.action,
            autoHideDuration: snack.autoHideDuration
        });
    };

    const history = useHistory();
    const location = useLocation();

    const drawer = (
        <div>
            <div className={classes.toolbar}>
                <div className={classes.topleft}>ImageStore</div>
            </div>
            <Divider />
            <List>
                <ListItem
                    button
                    selected={location.pathname === "/"}
                    onClick={() => {
                        history.push("/");
                        setMobileOpen(false);
                    }}
                >
                    <ListItemIcon>
                        <Photo />
                    </ListItemIcon>
                    <ListItemText primary="Photos" />
                </ListItem>
                <ListItem
                    button
                    selected={location.pathname.startsWith("/albums")}
                    onClick={() => {
                        history.push("/albums");
                        setMobileOpen(false);
                    }}
                >
                    <ListItemIcon>
                        <PhotoAlbum />
                    </ListItemIcon>
                    <ListItemText primary="Albums" />
                </ListItem>
            </List>
        </div>
    );

    const container = window !== undefined ? () => window().document.body : undefined;

    const drawerElement = (
        <nav className={classes.drawer} aria-label="mailbox folders">
            {/* The implementation can be swapped with js to avoid SEO duplication of links. */}
            <Hidden smUp implementation="css">
                <Drawer
                    container={container}
                    variant="temporary"
                    anchor={theme.direction === "rtl" ? "right" : "left"}
                    open={mobileOpen}
                    onClose={handleDrawerToggle}
                    classes={{
                        paper: classes.drawerPaper,
                    }}
                    ModalProps={{
                        keepMounted: true, // Better open performance on mobile.
                    }}
                >
                    {drawer}
                </Drawer>
            </Hidden>
            <Hidden xsDown implementation="css">
                <Drawer
                    classes={{
                        paper: classes.drawerPaper,
                    }}
                    variant="permanent"
                    open
                >
                    {drawer}
                </Drawer>
            </Hidden>
        </nav>
    );

    return (
        <>
            <Switch>
                <Route path="/albums">
                    <AlbumPage drawerElement={drawerElement} handleDrawerToggle={handleDrawerToggle} />
                </Route>
                <Route path="/">
                    <PhotoPage drawerElement={drawerElement} handleDrawerToggle={handleDrawerToggle} setSnack={setSnack} />
                </Route>
            </Switch>
            <Snackbar open={snack.open} onClose={closeSnack} autoHideDuration={snack.autoHideDuration} TransitionComponent={Slide}>
                <Alert variant="standard" onClose={closeSnack} severity={snack.severity}
                    action={
                        <>
                            {snack.action}
                            <IconButton
                                size="small"
                                color="inherit"
                                onClick={closeSnack}
                            >
                                <Close fontSize="small" />
                            </IconButton>
                      </>
                    }
                >
                    {snack.title ? <AlertTitle>{snack.title}</AlertTitle> : null}
                    {snack.body}
                </Alert>
            </Snackbar>
        </>
    );
}
