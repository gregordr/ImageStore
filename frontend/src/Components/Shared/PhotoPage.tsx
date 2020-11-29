import React, { RefObject, useEffect, useState } from "react";
import "./PhotoPage.css";
import { makeStyles } from "@material-ui/core/styles";
import MenuIcon from "@material-ui/icons/Menu";
import { CssBaseline, AppBar, Toolbar, IconButton, createStyles, Theme } from "@material-ui/core";
import TopBar from "./TopBar";
import { Route, Switch, useHistory } from "react-router-dom";
import ViewPage from "../ViewPage/ViewPage";
import axios from "axios";
import qs from "qs";
import { PhotoT, AlbumT } from "../../Interfaces";

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

    return (
        <div className={classes.photoDiv} onMouseEnter={() => setVis(0.4)} onMouseLeave={() => setVis(0)}>
            <input className={classes.photoBox} readOnly={true} checked={props.selected} type="checkbox" onClick={props.click} />
            <div onClick={props.click}>
                <img alt={props.id} style={{ transition: "0.05s linear" }} src={url} height={props.y - padding} width={props.x - padding} />
            </div>
        </div>
    );
}

const drawerWidth = 240;

export default function PhotoPage(props: { photos: PhotoT[] }) {
    const photos = props.photos;
    const [selected, setSelected] = useState<string[]>([]);
    const [selectable, setSelectable] = useState(false);
    const history = useHistory();

    const clickHandler = (id: string) => () => {
        if (anySelected()) {
            let copy = selected.slice();
            if (copy.includes(id)) copy = copy.filter((v) => v !== id);
            else copy.push(id);
            setSelected(copy);
            if (copy.length === 0) {
                setSelectable(false);
            }
        } else {
            history.push(`/view/${id}`);
        }
    };

    const anySelected = () => {
        return selected.length !== 0 || selectable;
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

    return <div className="Main-Content">{photos.map((p) => makePhoto(p))}</div>;
}
