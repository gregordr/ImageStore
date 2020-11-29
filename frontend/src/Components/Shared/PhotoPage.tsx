import React, { useState } from "react";
import "./PhotoPage.css";
import { makeStyles } from "@material-ui/core/styles";
import { PhotoT } from "../../Interfaces";

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
            <div onClick={props.imageClick}>
                <img alt={props.id} style={{ transition: "0.05s linear" }} src={url} height={props.y - padding} width={props.x - padding} />
            </div>
        </div>
    );
}

export default function AbstractPhotoPage(props: { photos: PhotoT[]; clickHandler: (id: string) => () => void; imageClickHandler: (id: string) => () => void; selected: string[]; anySelected: any }) {
    const photos = props.photos;

    const height = 300.0;

    const makePhoto = (photo: PhotoT) => (
        <Photo
            key={photo.id}
            id={photo.id}
            x={(photo.width * height) / photo.height}
            y={height}
            click={props.clickHandler(photo.id)}
            imageClick={props.imageClickHandler(photo.id)}
            selected={props.selected.includes(photo.id)}
            outZoom={0.9}
            anySelected={props.anySelected}
        />
    );

    return <div className="Main-Content">{photos.map((p) => makePhoto(p))}</div>;
}
