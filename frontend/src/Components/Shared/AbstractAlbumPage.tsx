import React, { useCallback, useState, useRef, useEffect } from "react";
import { createMuiTheme, createStyles, makeStyles, ThemeProvider } from "@material-ui/core/styles";
import { AlbumT } from "../../Interfaces";
import { VariableSizeList as List } from "react-window";
import { Scrollbars } from "react-custom-scrollbars";
import { GridList, GridListTile, GridListTileBar, IconButton } from "@material-ui/core";
import { PhotoAlbum, Info } from "@material-ui/icons";
import { useHistory } from "react-router-dom";
import AlbumInfo from "../AlbumPage/AlbumInfo";
import { baseURL } from "../../API";

const theme = createMuiTheme({
    palette: {
        primary: {
            main: "#cccccc",
            dark: "#cccccc",
            light: "#cccccc",
        },
    },
});

const useStyles = makeStyles(() =>
    createStyles({
        root: {
            overflow: "hidden",
        },
        icon: {
            color: "rgba(255, 255, 255, 0.54)",
        },
        photoDiv: {
            margin: 5,
            // height: props.y,
            // width: props.x,
            // "align-items": "center",
            // "justify-content": "center",
            display: "flex",
            flexFlow: "row wrap",
            // background: "#aaaaaa33",
            // position: "relative",
        },
        // photoBox: { transition: "0.07s all  linear", position: "absolute", left: 15, top: 15, height: 20, width: 20, opacity: opacity },
    })
);

function Album(props: { album: AlbumT; click: () => void; fetchAlbums: () => Promise<void>; dimension: number }) {
    const classes = useStyles();
    const history = useHistory();
    const [openInfo, setOpenInfo] = useState(false);

    const onImageClick = () => {
        history.push(`/albums/open/${props.album.id}`);
    };

    return (
        <>
            <GridListTile
                key={props.album.id}
                style={{
                    padding: 5,
                    paddingTop: 10,
                    height: props.dimension,
                    width: props.dimension,
                    backgroundColor: "white",
                }}
                onClick={onImageClick}
            >
                {props.album.cover === null ? (
                    <PhotoAlbum style={{ height: props.dimension, width: props.dimension, color: "#666666" }} />
                ) : (
                    <div
                        style={{
                            backgroundImage: `url(${baseURL + "/media/thumb_" + props.album.cover})`,
                            backgroundSize: "cover",
                            backgroundPosition: "center",
                            height: props.dimension,
                            width: props.dimension,
                        }}
                    />
                )}
                <GridListTileBar
                    title={props.album.name}
                    subtitle={<span>{props.album.imagecount} elements</span>}
                    actionIcon={
                        //To do: remove this to increase scroll speed
                        <ThemeProvider theme={theme}>
                            <IconButton
                                aria-label={`info about ${props.album.name}`}
                                color="primary"
                                onClick={(e) => {
                                    setOpenInfo(true);
                                    e.stopPropagation();
                                }}
                                className={classes.icon}
                            >
                                <Info />
                            </IconButton>
                        </ThemeProvider>
                    }
                />
            </GridListTile>
            <AlbumInfo album={props.album} open={openInfo} setOpen={setOpenInfo} fetchAlbums={props.fetchAlbums}></AlbumInfo>
        </>
    );
}

const makeAlbum = (album: AlbumT, dimension: number, props: any) => <Album key={album.id} album={album} dimension={dimension} click={props.openAlbum(album)} fetchAlbums={props.fetchAlbums} />;
//need to pass h/w too tho

const targetHeight = 200;

const calculate = (photos: AlbumT[], width: number) => {
    const rowH: number[] = [];
    const rowPics: AlbumT[][] = [];

    let ptr = 0;
    let setH = -1;
    while (ptr !== photos.length) {
        let curPics: AlbumT[] = [];
        let curWidth = 0;

        while (ptr !== photos.length && (curWidth === 0 || Math.abs(targetHeight - (targetHeight * width) / curWidth) > Math.abs(targetHeight - (targetHeight * width) / (curWidth + targetHeight)))) {
            curPics.push(photos[ptr]);
            curWidth += targetHeight;
            ptr++;
        }

        if (setH === -1) setH = (targetHeight * width) / curWidth;

        if (rowPics.length === 0 && curWidth <= width && ptr === photos.length) rowH.push(targetHeight);
        else rowH.push(setH);
        rowPics.push(curPics);
    }

    return { rowH, rowPics };
};

const Row = (altprops: any) =>
    altprops.data.linNum <= altprops.index ? (
        <GridList className={altprops.data.classes.root}>
            <div style={{ ...altprops.style, display: "flex", transition: "0.05s linear" }}>
                {altprops.data.rowPics[altprops.index].map((a: AlbumT) => makeAlbum(a, altprops.data.rowH[altprops.index], altprops.data.props))}
            </div>
        </GridList>
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

export default function AbstractAlbumPage(props: {
    albums: AlbumT[];
    height: number;
    width: number;
    openAlbum: (arg0: AlbumT) => () => void;
    fetchAlbums: () => void;
    heights: number[];
    lines: any[];
}) {
    const classes = useStyles();
    const listRef = useRef<List>(null);
    useEffect(() => listRef.current?.resetAfterIndex(0), [props.width, props.albums, props.heights]);
    let { rowH, rowPics } = calculate(props.albums, props.width - 20);
    rowH = [...props.heights, ...rowH];
    rowPics = [...props.lines, ...rowPics];
    const getItemSize = (index: number) => rowH[index];

    return (
        <List
            overscanCount={2}
            height={props.height}
            ref={listRef}
            itemData={{ rowH, rowPics, props, linNum: props.lines.length, classes }}
            itemCount={rowH.length}
            itemSize={getItemSize}
            width={props.width - 1}
            outerElementType={CustomScrollbarsVirtualList}
        >
            {Row}
        </List>
    );
}
