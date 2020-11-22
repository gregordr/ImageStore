import { isAbsolute } from 'path';
import React, { useState } from 'react';

function Photo(props: { id: string, x: number, y: number, click: any, selected: boolean, outZoom: number }) {
    const url = "https://i.imgur.com/" + props.id + ".jpg"
    const padding = props.selected ? 25 : 0
    return <div style={{ margin: 10, height: props.y, width: props.x, "align-items": "center", "justify-content": "center", display: "flex" }}>
        <img style={{ transition: "0.05s linear" }}
            src={url}
            alt="new"
            height={props.y - padding}
            width={props.x - padding}
            onClick={props.click}
        /></div>;
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
    return (<div>{photos.map((p) => makePhoto(p))}</div>)
}