import React, { useCallback, useState, useMemo } from "react";
import { makeStyles } from "@material-ui/core/styles";
import { PhotoT } from "../../Interfaces";

const useStyles = makeStyles({
    photoDiv: {
        margin: 5,
        "align-items": "center",
        "justify-content": "center",
        display: "flex",
        background: "#aaaaaa33",
        position: "relative",
    },
    photoBox: { transition: "0.07s all  linear", position: "absolute", left: 15, top: 15, height: 20, width: 20 },
});

const Photo = React.memo(function Photo(props: any) {
    const url = "http://localhost:4000/media/" + props.id;
    const padding = props.selected ? 0.9 : 1.0;
    const [vis, setVis] = useState(false);

    const classes = useStyles();
    const onClick = useCallback(() => props.imageClick(props.id), [props.id]);
    const onClick2 = useCallback(() => props.click(props.id), [props.id]);
    return (
        <div
            className={classes.photoDiv}
            style={{
                height: props.y,
                width: props.x,
            }}
            onMouseEnter={() => setVis(true)}
            onMouseLeave={() => setVis(false)}
        >
            <div onClick={onClick}>
                <img alt={props.id} style={{ transition: "0.05s linear", transform: `scale(${padding})` }} src={url} height={props.y} width={props.x} />
            </div>
            {(vis || props.selected || props.anySelected) && (
                <input
                    className={classes.photoBox}
                    style={{ opacity: vis && !props.selected && !props.anySelected ? 0.4 : 1.0 }}
                    readOnly={true}
                    checked={props.selected}
                    type="checkbox"
                    onClick={onClick2}
                />
            )}
        </div>
    );
});

export default function AbstractPhotoPage(props: { photos: PhotoT[]; clickHandler: (id: string) => void; imageClickHandler: (id: string) => void; selected: string[]; anySelected: any }) {
    const { selected } = props;
    const photos = props.photos;

    const height = 300.0;

    const s = useMemo(() => new Set(selected), [selected]);
    const makePhoto = (photo: PhotoT) => (
        <Photo
            key={photo.id}
            id={photo.id}
            x={(photo.width * height) / photo.height}
            y={height}
            click={props.clickHandler}
            imageClick={props.imageClickHandler}
            selected={s.has(photo.id)}
            anySelected={s.size !== 0}
            outZoom={0.9}
        />
    );

    return (
        <div
            style={{
                display: "flex",
                flexWrap: "wrap",
            }}
        >
            {photos.map((p) => makePhoto(p))}
        </div>
    );
}
