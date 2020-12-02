import React, { useState } from "react";
import "./ViewPage.css";
import { useHistory } from "react-router-dom";
import { useTransition, animated } from "react-spring";
import TopLeftBar from "./TopLeftBar";
import { createMuiTheme, IconButton, ThemeProvider } from "@material-ui/core";
import { ChevronLeft, ChevronRight } from "@material-ui/icons";

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

export default function ViewPage(props: any) {
    const history = useHistory();
    const [id, setId] = useState(window.location.pathname.split("/").slice(-1)[0]);
    const [dir, setDir] = useState(0);
    const [opacityRight, setOpacityRight] = useState(0);
    const [opacityLeft, setOpacityLeft] = useState(0);

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
            await props.buttonFunctions.delete(id);

            if (canGo(-1)) go(-1)();
            else if (canGo(1)) go(1)();
            else history.goBack();
        },
        remove: async (id: string) => {
            await props.buttonFunctions.remove(id);

            if (canGo(-1)) go(-1)();
            else if (canGo(1)) go(1)();
            else history.goBack();
        },
    };

    return (
        <ThemeProvider theme={theme}>
            {transitions.map(({ item, props, key }) => (
                <div key={key} className="imageHolder">
                    <animated.div style={{ ...props, alignSelf: "center", justifySelf: "center" }}>
                        <img className="display" alt={id} style={{ objectFit: "scale-down", height: "100vh", width: "100vw" }} src={item} />
                    </animated.div>
                </div>
            ))}

            <div className="root">
                <div className="leftIm" onMouseEnter={mouseLeft} onClick={go(-1)}>
                    <TopLeftBar />
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
                    {props.topRightBar(id, modifiedButtonFunctions)}
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
        </ThemeProvider>
    );
}
