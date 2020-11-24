import React, { useState } from 'react';
import './PhotoPage.css';
import { makeStyles } from '@material-ui/core/styles';
import MenuIcon from '@material-ui/icons/Menu';
import { CssBaseline, AppBar, Toolbar, IconButton, createStyles, Theme } from '@material-ui/core';
import TopBar from './TopBar';
import { Route, Switch, useHistory } from 'react-router-dom';
import ViewPage from '../ViewPage/ViewPage';

function Photo(props: any) {
    const url = "https://i.imgur.com/" + props.id + ".jpg"
    const padding = props.selected ? 35 : 0
    const [vis, setVis] = useState(0)
    const opacity = props.anySelected() ? 255 : vis

    const useStyles = makeStyles({
        photoDiv: {
            margin: 5, height: props.y, width: props.x, "align-items": "center", "justify-content": "center", display: "flex", background: "#aaaaaa33", position: "relative"
        },
        photoBox: { transition: "0.07s all  linear", position: "absolute", left: 15, top: 15, height: 20, width: 20, opacity: opacity }
    });

    const classes = useStyles();
    const history = useHistory();

    const onImageClick = () => {
        if (props.anySelected()) {
            props.click();
        } else {
            history.push(`/view/${props.id}`)
        }
    }

    return <div className={classes.photoDiv} onMouseEnter={() => setVis(0.4)} onMouseLeave={() => setVis(0)}>
        <input className={classes.photoBox} checked={props.selected} type="checkbox" id="vehicle1" onClick={props.click} />
        <div onClick={onImageClick} >
            <img style={{ transition: "0.05s linear" }}
                src={url}
                height={props.y - padding}
                width={props.x - padding}
            />
        </div>
    </div>;
}


const drawerWidth = 240;
const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        root: {
            display: 'flex',
        },
        drawer: {
            [theme.breakpoints.up('sm')]: {
                width: drawerWidth,
                flexShrink: 0,
            },
        },
        appBar: {
            background: "white",
            [theme.breakpoints.up('sm')]: {
                width: `calc(100% - ${drawerWidth}px)`,
                marginLeft: drawerWidth,
            },
        },
        menuButton: {
            color: theme.palette.primary.main,
            marginRight: theme.spacing(2),
            [theme.breakpoints.up('sm')]: {
                display: 'none',
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
            height: 64
        },
        content: {
            flexGrow: 1,
            padding: theme.spacing(3),
        },
    })
);

export default function PhotoPage(props: any) {
    const classes = useStyles();
    const [photos, setPhotos] = useState(["LnAraXJ", "5wgb9id", "uJeLOjr", "cBUBtqp", "FR4svrQ", "sd", "as", "uJeLOjr", "cBUBtqp", "FR4svrQ", "sd", "as", "uJeLOjr", "cBUBtqp", "FR4svrQ", "sd", "as", "uJeLOjr", "cBUBtqp", "FR4svrQ", "sd", "as"])
    const map = new Map<string, boolean>();
    photos.map((p) => map.set(p, false))
    const [selected, setSelected] = useState(map);
    const [selectable, setSelectable] = useState(false);
    const clickHandler = (id: string) => () => {
        const copy = new Map(selected)
        copy.set(id, !selected.get(id) ?? true)
        setSelected(copy)
        let anySelected = false;
        selected.forEach((v, _) => anySelected = anySelected || v)
        if (!anySelected) {
            setSelectable(false)
        }
    }

    props.setCurrent("/")

    const anySelected = () => {
        let anySelected = false;
        selected.forEach((v, _) => anySelected = anySelected || v)
        return anySelected || selectable;
    }

    const buttonFunctions = {
        delete: () => {
            setPhotos(photos.slice().filter(p => !selected.get(p)))
            buttonFunctions.unselect()
        },
        unselect: () => {
            const copy = new Map()
            photos.map((p) => copy.set(p, false))
            setSelected(copy)
            setSelectable(false)
        },
        upload: () => {
            //Nav to upload page
        },
        settings: () => {
            //Nav to settings page
        },
        select: () => {
            setSelectable(true)
        },
    }

    const makePhoto = (id: string) => <Photo key={id} id={id} x={300} y={300} click={clickHandler(id)} selected={selected.get(id) ?? false} outZoom={0.9} anySelected={anySelected} />

    return (
        <Switch>
            <Route path="/view">
                <ViewPage photos={photos}></ViewPage>
            </Route>
            <Route path="/">
                <div className={classes.root}>
                    <CssBaseline />

                    <AppBar position="fixed" className={classes.appBar}>
                        <Toolbar>
                            <IconButton
                                color="inherit"
                                aria-label="open drawer"
                                edge="start"
                                onClick={props.handleDrawerToggle}
                                className={classes.menuButton}
                            >
                                <MenuIcon />
                            </IconButton>
                            <TopBar anySelected={anySelected} buttonFunctions={buttonFunctions} />
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
    )
}