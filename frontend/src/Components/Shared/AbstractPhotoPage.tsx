import React, { useCallback, useState, useRef, useEffect } from "react";
import { makeStyles, useTheme } from "@material-ui/core/styles";
import { PhotoT } from "../../Interfaces";
import { VariableSizeList as List } from "react-window";
import { Scrollbars } from "react-custom-scrollbars";
import { baseURL } from "../../API";
import { IconButton, useMediaQuery } from "@material-ui/core";
import { PlayArrow, VideoCall } from "@material-ui/icons";

const useStyles = makeStyles({
    photoDiv: {
        padding: 10,
        "align-items": "center",
        "justify-content": "center",
        display: "flex",
        position: "relative",
        transition: "0.05s linear",
    },
    photoBox: { transition: "0.05s linear", position: "absolute", left: 15, top: 15, height: 20, width: 20 },
    videoIcon: { position: "absolute", left: 40, top: 15, height: 20, width: 20, color: "#666666" },
});

function Photo(props: any) {
    const realUrl = baseURL + "/media/thumb_" + props.id;
    const [url, setUrl] = useState("");
    const [play, setPlay] = useState(false);
    useEffect(() => {
        const timeout = setTimeout(() => setUrl(baseURL + "/media/thumb_" + props.id), 500);
        return () => clearTimeout(timeout);
    }, [props.id]);
    useEffect(() => {
        if (!props.isScrolling) setUrl(realUrl);
    });
    const padding = props.selected ? 0.9 : 1.0;
    const [vis, setVis] = useState(0);
    const opacity = props.anySelected() ? 255 : vis;

    const classes = useStyles();
    const vidRef = useRef<HTMLVideoElement>(null);

    return (
        <div
            className={classes.photoDiv}
            style={{
                height: props.y,
                width: props.x,
                boxShadow: props.marked?"inset 0px 0px 0px 100px rgb(0,0,255,0.6)":""
            }}
            onMouseEnter={async () => {
                setVis(0.4);
                setPlay(true);
                if (vidRef.current) {
                    setTimeout(() => vidRef.current?.play(), 50);
                }
            }}
            onMouseLeave={() => {
                setVis(0);
                setPlay(false);
                if (vidRef.current) {
                    setTimeout(() => {
                        vidRef.current?.pause();
                        if (vidRef.current) vidRef.current.currentTime = 0;
                    }, 50);
                }
            }}
        >
            <div
                onClick={props.imageClick}
                onMouseOver={props.hoverEventHandler}
            >
                <div
                    style={{
                        backgroundColor: "#eeeeee",
                        height: props.y - 5,
                        width: props.x - 5,
                    }}>
                    {props.type === "photo" ? (
                        <div
                            style={{
                                transition: "0.05s linear",
                                transform: `scale(${padding})`,
                                backgroundImage: url === "" ? "none" : `url(${url})`,
                                height: props.y - 5,
                                width: props.x - 5,
                                backgroundSize: "100% 100%",
                            }}
                        />
                    ) : (
                        <video
                            style={{
                                transition: "0.05s linear",
                                transform: `scale(${padding})`,
                                backgroundImage: url === "" ? "none" : `url(${url})`,
                                height: props.y - 5,
                                width: props.x - 5,
                                backgroundSize: "100% 100%",
                            }}
                            autoPlay
                            muted
                            loop
                            ref={vidRef}
                        >
                            {play && <source src={url === "" ? "" : baseURL + "/media/prev_" + props.id} type="video/mp4" />}
                        </video>
                    )}
                </div>
            </div>
            {(vis || props.anySelected() || true) && <input
                className={classes.photoBox}
                style={{ opacity: opacity }}
                readOnly={true}
                checked={props.selected}
                type="checkbox"
                onClick={props.click}
                onMouseOver={props.hoverEventHandler} />
            }
            {props.type === "video" && !play && (
                <IconButton className={classes.videoIcon}>
                    <PlayArrow style={{ fontSize: "28" }}></PlayArrow>
                </IconButton>
            )}
        </div>
    );
}
const makePhoto = (photo: PhotoT, realH: number, props: any, isScrolling: boolean) => (
    <Photo
        key={photo.id}
        id={photo.id}
        x={(photo.width * realH) / photo.height}
        y={realH}
        click={props.clickHandler(photo.id)}
        imageClick={props.imageClickHandler(photo.id)}
        hoverEventHandler={props.hoverEventHandler(photo.id)}
        selected={props.selected.includes(photo.id)}
        marked={props.marked.includes(photo.id)}
        anySelected={props.anySelected}
        outZoom={0.9}
        isScrolling={isScrolling}
        type={photo.type}
    />
);

const targetHeight = 300;

const calculate = (photos: PhotoT[], width: number) => {
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
            curWidth += (photos[ptr].width / photos[ptr].height) * targetHeight;
            ptr++;
        }

        rowPics.push(curPics);
        if (ptr !== photos.length || width < curWidth) {
            if (!((targetHeight * width) / curWidth)) {
                rowH.push(1);
            }
            rowH.push((targetHeight * width) / curWidth);
        } else rowH.push(targetHeight);
    }

    return { rowH, rowPics };
};

const Row = (altprops: any) =>
    altprops.data.linNum <= altprops.index ? (
        <div style={{ ...altprops.style, display: "flex", transition: "0.05s linear" }}>
            {altprops.data.rowPics[altprops.index].map((p: PhotoT) => makePhoto(p, altprops.data.rowH[altprops.index], altprops.data.props, altprops.isScrolling))}
        </div>
    ) : (
        <div>{altprops.data.rowPics[altprops.index]}</div>
    );

const CustomScrollbars = ({ onScroll, forwardedRef, style, children }: any) => {
    const refSetter = useCallback(
        (scrollbarsRef) => {
            if (scrollbarsRef) {
                forwardedRef(scrollbarsRef.view);
            } else {
                forwardedRef(null);
            }
        },
        [forwardedRef]
    );

    return (
        <Scrollbars ref={refSetter} style={{ ...style, overflow: "hidden" }} onScroll={onScroll}>
            {children}
        </Scrollbars>
    );
};

const CustomScrollbarsVirtualList = React.forwardRef((props, ref) => <CustomScrollbars {...props} forwardedRef={ref} />);

export default function AbstractPhotoPage(props: {
    photos: PhotoT[];
    height: number;
    width: number;
    clickHandler: (id: string) => () => void;
    imageClickHandler: (id: string) => () => void;
    hoverEventHandler: (id: string) => () => void;
    marked: string[];
    selected: string[];
    anySelected: any;
    heights: number[];
    lines: any[];
    viewId: string;
    setViewId: (id: string) => void;
}) {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
    const [jumped, setJumped] = useState(false);
    const listRef = useRef<List>(null);
    useEffect(() => {
        listRef.current?.resetAfterIndex(0);
        const item = tmpRowPics.findIndex((photos: PhotoT[]) => {
            return photos.filter((p) => p.id === props.viewId).length !== 0;
        });
        if (!jumped && item !== 1) listRef.current?.scrollToItem(item + props.lines.length, "smart");
        setJumped(true);
    }, [props.width, props.photos, props.heights]);
    const { rowH: tmpRowH, rowPics: tmpRowPics } = calculate(props.photos, props.width - 12);
    const rowH = [...props.heights, ...tmpRowH];
    const rowPics = [...props.lines, ...tmpRowPics];
    const getItemSize = (index: number) => (index !== rowH.length - 1 ? rowH[index] : rowH[index] + (isMobile ? 60 : 20));

    return (
        <List
            useIsScrolling
            overscanCount={10}
            height={props.height}
            ref={listRef}
            itemData={{ rowH, rowPics, props, linNum: props.lines.length }}
            itemCount={rowH.length}
            itemSize={getItemSize}
            width={props.width - 1}
            outerElementType={CustomScrollbarsVirtualList}
        >
            {Row}
        </List>
    );
}
