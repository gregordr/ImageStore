import React, { useState } from 'react';
import "./ViewPage.css"
import { useHistory } from 'react-router-dom';
import { useTransition, animated } from 'react-spring'

export default function ViewPage(props: any) {
    const history = useHistory()
    const [id, setId] = useState(window.location.pathname.split("/")[2])
    const [dire, setDir] = useState(0)

    const url = "https://i.imgur.com/" + id + ".jpg"

    const x = 500
    const y = 750

    const go = (dir: number) => () => {
        const photos: string[] = props.photos
        let ind = photos.findIndex((v) => v === id)
        if (ind + dir >= 0 && ind + dir < photos.length) {
            setDir(50 * dir)
            ind += dir
            history.replace(`/view/${photos[ind]}`)
            setId(photos[ind])
        }
    }


    const transitions = useTransition(url, p => p, {
        from: { opacity: 0, transform: `translate3d(${dire}%,0,0)` },
        enter: { opacity: 1, transform: 'translate3d(0%,0,0)' },
        leave: { opacity: 0, transform: 'translate3d(-50%,0,0)' },
    })

    return (
        <div>


            {transitions.map(({ item, props, key }) => {
                return <div key={key} className="imageHolder"><animated.div style={{ ...props, alignSelf: "center", justifySelf: "center" }}><img className="display" alt={id} style={{ "width": x, "height": y }} src={item} /></animated.div>
                </div>
            })}

            <div className="root">
                <div className="leftIm" onClick={go(-1)}></div>
                <div className="center" onClick={() => history.goBack()}></div>
                <div className="rightIm" onClick={go(1)}></div>
            </div>
        </div>
    )
}