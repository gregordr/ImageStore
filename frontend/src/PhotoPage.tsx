import { isAbsolute } from 'path';
import React, { useState } from 'react';

function Photo(props: { id: string, x: number, y: number, click: any, selected: boolean, outZoom: number }) {
    const url = "https://i.imgur.com/" + props.id + ".jpg"
    const padding = props.selected ? 25 : 0
    const [vis, setVis] = useState(0)
    const opacity = props.selected ? 255 : vis
    return <div onMouseEnter={() => setVis(0.4)} onMouseLeave={() => setVis(0)} style={{ margin: 5, height: props.y, width: props.x, "align-items": "center", "justify-content": "center", display: "flex", background: "#ffffff22", position: "relative" }}>
        <input checked={props.selected} type="checkbox" id="vehicle1" onClick={props.click} style={{ transition: "0.08s linear", position: "absolute", left: 15, top: 15, height: 20, width: 20, opacity: opacity }} />
        <a href={url} ><img style={{ transition: "0.05s linear" }}
            src={url}
            alt="new"
            height={props.y - padding}
            width={props.x - padding}
        /></a></div>;
}

export default function PhotoPage(props: {}) {
    const photos = ["LnAraXJ", "5wgb9id", "uJeLOjr", "uJeLOjr", "uJeLOjr", "uJeLOjr", "uJeLOjr", "uJeLOjr", "uJeLOjr", "uJeLOjr"]
    const map = new Map<string, boolean>();
    photos.map((p) => map.set(p, false))
    const [selected, setSelected] = useState(map);
    const clickHandler = (id: string) => () => {
        const copy = new Map(selected)
        copy.set(id, !selected.get(id) ?? true)
        setSelected(copy)

    }
    const makePhoto = (id: string) => <Photo key={id} id={id} x={300} y={300} click={clickHandler(id)} selected={selected.get(id) ?? false} outZoom={0.9} />
    return (<div style={{ display: "flex", "flex-wrap": "wrap", "margin-top": 100 }}>{photos.map((p) => makePhoto(p))}</div>)
}