import React, { useState } from 'react';
import TopBar from './Components/TopBar';
import './App.css';
import { makeStyles } from '@material-ui/core/styles';

function Photo(props: any) {

    const url = "https://i.imgur.com/" + props.id + ".jpg"
    const padding = props.selected ? 25 : 0
    const [vis, setVis] = useState(0)
    const opacity = props.selected ? 255 : vis

    const useStyles = makeStyles({
        photoDiv: {
            margin: 5, height: props.y, width: props.x, "align-items": "center", "justify-content": "center", display: "flex", background: "#ffffff22", position: "relative"
        },
        photoBox: { transition: "0.07s all  linear", position: "absolute", left: 15, top: 15, height: 20, width: 20, opacity: opacity }
    });

    const classes = useStyles();

    const onImageClick = () => {
        if (props.anySelected()) {
            props.click();
        } else {
            console.log("navigate")
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

export default function PhotoPage(props: {}) {
    const [photos, setPhotos] = useState(["LnAraXJ", "5wgb9id", "uJeLOjr", "cBUBtqp", "FR4svrQ", "sd", "as"])
    const map = new Map<string, boolean>();
    photos.map((p) => map.set(p, false))
    const [selected, setSelected] = useState(map);
    const clickHandler = (id: string) => () => {
        const copy = new Map(selected)
        copy.set(id, !selected.get(id) ?? true)
        setSelected(copy)

    }

    const anySelected = () => {
        let anySelected = false;
        selected.forEach((v, _) => anySelected = anySelected || v)
        return anySelected;
    }

    const buttonFunctions = {
        delete: () => {
            setPhotos(photos.slice().filter(p => !selected.get(p)))
            buttonFunctions.unselect()
        },
        unselect: () => {
            const copy = new Map(selected)
            copy.forEach((_, p) => copy.set(p, false))
            setSelected(copy)
        },
        upload: () => {
            //Nav to upload page
        },
        settings: () => {
            //Nav to settings page
        },
    }

    const makePhoto = (id: string) => <Photo key={id} id={id} x={300} y={300} click={clickHandler(id)} selected={selected.get(id) ?? false} outZoom={0.9} anySelected={anySelected} />

    return (
        <div className="grid-container">
            <div className="LeftBar"></div>
            <TopBar anySelected={anySelected} buttonFunctions={buttonFunctions} />
            <div className="Main-Content">{photos.map((p) => makePhoto(p))}</div>
        </div>)
}