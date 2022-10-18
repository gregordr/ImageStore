import MenuIcon from "@material-ui/icons/Menu";
import { makeStyles } from "@material-ui/core/styles";
import { AppBar, Toolbar, IconButton, createStyles, Theme } from "@material-ui/core";
import { useEffect, useMemo, useState } from "react";
import { useHistory, useLocation } from "react-router-dom";
import { LocPhotoT, PhotoT } from "../../Interfaces";
import PhotoMap from "../Shared/PhotoMap";
import qs from "qs";
import { useAllPhotosQuery } from "../../Queries/PhotoQueries";

const drawerWidth = 240;
const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        root: {
            display: "flex",
            color: "black",
        },
        drawer: {
            [theme.breakpoints.up("sm")]: {
                width: drawerWidth,
                flexShrink: 0,
            },
        },
        onlyMobile: {
            [theme.breakpoints.up("md")]: {
                display: "none",
            },
        },
        appBar: {
            background: "white",
            [theme.breakpoints.up("sm")]: {
                width: `calc(100% - ${drawerWidth}px)`,
                marginLeft: drawerWidth,
            },
            color: "black",
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
            color: "black",
        }
    })
);

export default function MapPage(props: { handleDrawerToggle: () => void; drawerElement: any; searchByImageEnabled: boolean }) {
    const classes = useStyles();
    const query = useAllPhotosQuery();
    const history = useHistory()

    const { search: queryUrl } = useLocation() as { search: string };

    const { center: initialReportedCenter, zoom: initialZoom } = qs.parse(queryUrl.substring(1)) as { center?: string[], zoom?: string }
    const [zoom, setZoom] = useState(Number(initialZoom) || 6);

    const intialCenter = useMemo(() => {
        if (initialReportedCenter && Number(initialReportedCenter[0]) && Number(initialReportedCenter[1])) {
            return [Number(initialReportedCenter[0]), Number(initialReportedCenter[1])] as [number, number];
        }
        if (!query.data) {
            return [0, 0] as [number, number];
        }

        const maximums = (query.data?.data as PhotoT[]).filter((photo) => photo.coordx && photo.coordy).map((photo) => photo as LocPhotoT).reduce(
            (current, photo) => {
                return {
                    maxX: Math.max(current.maxX, photo.coordx),
                    minX: Math.min(current.minX, photo.coordx),
                    maxY: Math.max(current.maxY, photo.coordy),
                    minY: Math.min(current.minY, photo.coordy)
                }
            },
            {
                maxX: 0,
                minX: 400,
                maxY: 0,
                minY: 400
            }
        )

        return [(maximums.maxX + maximums.minX) / 2, (maximums.maxY + maximums.minY) / 2] as [number, number]
    }, [query.data])

    const [center, setCenter] = useState<[number, number]>(intialCenter);

    useEffect(() => {
        history.push({ search: qs.stringify({ zoom, center }) })
    }, [zoom, center]);

    return (
        <div className={classes.root}>
            <AppBar position="fixed" className={classes.appBar}>
                <Toolbar>
                    <IconButton color="inherit" aria-label="open drawer" edge="start" onClick={props.handleDrawerToggle} className={classes.menuButton}>
                        <MenuIcon />
                    </IconButton>
                </Toolbar>
            </AppBar>

            {props.drawerElement}

            <main className={classes.content}>
                <div className={classes.toolbar} />

                {query.data && (
                    <PhotoMap markers={[]} photos={query.data.data} defaultZoom={zoom} center={intialCenter} onClickCallback={(photo: LocPhotoT) => {
                        history.push(`/view/${photo.id}`);
                    }} mapStyle={{ height: "100%", width: "100%" }}
                        onZoomCallback={setZoom}
                        onPanCallback={setCenter}
                    />
                )}
            </main>
        </div>
    );
}
