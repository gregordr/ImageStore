import React, { useCallback, useState, useMemo } from "react";
import { makeStyles } from "@material-ui/core/styles";
import { PhotoT } from "../../Interfaces";
import { VariableSizeList as List } from "react-window";
import AutoSizer from "react-virtualized-auto-sizer";

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

function Photo(props: any) {
    const url = "http://localhost:4000/media/" + props.id;
    const padding = props.selected ? 0.9 : 1.0;
    const [vis, setVis] = useState(0);
    const opacity = props.anySelected() ? 255 : vis;

    const classes = useStyles();
    return (
        <div
            className={classes.photoDiv}
            style={{
                height: props.y,
                width: props.x,
            }}
            onMouseEnter={() => setVis(0.4)}
            onMouseLeave={() => setVis(0)}
        >
            <div onClick={props.imageClick}>
                <img alt={props.id} style={{ transition: "0.05s linear", transform: `scale(${padding})` }} src={url} height={props.y} width={props.x} />
            </div>
            {(vis || props.anySelected()) && <input className={classes.photoBox} style={{ opacity: opacity }} readOnly={true} checked={props.selected} type="checkbox" onClick={props.click} />}
        </div>
    );
}

export default function AbstractPhotoPage(props: { photos: PhotoT[]; clickHandler: (id: string) => () => void; imageClickHandler: (id: string) => () => void; selected: string[]; anySelected: any }) {
    const makePhoto = (photo: PhotoT, realH: number) => (
        <Photo
            key={photo.id}
            id={photo.id}
            x={(photo.width * realH) / photo.height}
            y={realH}
            click={props.clickHandler(photo.id)}
            imageClick={props.imageClickHandler(photo.id)}
            selected={props.selected.includes(photo.id)}
            anySelected={props.anySelected}
            outZoom={0.9}
        />
    );

    const targetHeight = 300;
    const width = 900;

    const calculate = (photos: PhotoT[]) => {
        const rowH: number[] = [];
        const rowPics: PhotoT[][] = [];

        let ptr = 0;

        while (ptr !== photos.length) {
            let curPics: PhotoT[] = [];
            let curWidth = 0;

            while (
                ptr !== photos.length &&
                (curWidth === 0 ||
                    Math.abs(targetHeight - (targetHeight * width) / curWidth) > Math.abs(targetHeight - (targetHeight * width) / (curWidth + (photos[ptr].width / photos[ptr].height) * targetHeight)))
            ) {
                curPics.push(photos[ptr]);
                curWidth += (photos[ptr].width / photos[ptr].height) * targetHeight + 10;
                ptr++;
            }

            rowPics.push(curPics);
            rowH.push((targetHeight * width) / curWidth);
        }

        return { rowH, rowPics };
    };

    const { rowH, rowPics } = useMemo(() => calculate(props.photos), [props.photos]);

    const getItemSize = (index: number) => rowH[index] + 10;

    const Row = (props: any) => <div style={{ ...props.style, display: "flex" }}> {rowPics[props.index].map((p) => makePhoto(p, rowH[props.index]))} </div>;

    console.log(rowH.length);
    console.log(rowH);
    console.log(rowPics);
    return (
        <List height={800} itemCount={rowH.length} itemSize={getItemSize} width={width}>
            {Row}
        </List>
    );
    // <div
    //     style={{
    //         display: "flex",
    //         flexWrap: "wrap",
    //     }}
    // >
    //     {photos.map((p) => makePhoto(p))}
    // </div>
}
