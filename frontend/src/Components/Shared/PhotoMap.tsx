import { Icon } from "leaflet";
import { useState, useMemo } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { MapContainer, TileLayer, Marker, useMapEvents, Popup } from "react-leaflet";
import { LocPhotoT, PhotoT } from "../../Interfaces";


export default function PhotoMap(
    { markers, photos, defaultZoom, center, onClickCallback, mapStyle, iconSize = 75, onZoomCallback, onPanCallback }:
        { markers: [number, number][], photos: PhotoT[], defaultZoom: number, center: [number, number], onClickCallback: (photo: LocPhotoT) => void, onZoomCallback: (zoom: number) => void, mapStyle: any, iconSize?: number, onPanCallback: (center: [number, number]) => void }) {

    const [zoom, setZoom] = useState<number>(defaultZoom);
    function MapProperties() {
        const mapProps = useMapEvents({
            zoomend(e) {
                setZoom(mapProps.getZoom());
                onZoomCallback(mapProps.getZoom());
            },
            moveend(e) {
                onPanCallback([mapProps.getCenter().lat, mapProps.getCenter().lng]);
            }
        });
        return null;
    }


    const selectPicture = (photos: PhotoT[], result: PhotoT[], minDist = 0) => {
        let best = null;
        for (const photo of photos) {
            if (result.find((used) => Math.abs(used.coordx! - photo.coordx!) + Math.abs(used.coordy! - photo.coordy!) < minDist)) continue;

            if (!best || Math.max(best.coordx! / best.coordy!, best.coordy! / best.coordx!) > Math.max(photo.coordx! / photo.coordy!, photo.coordy! / photo.coordx!)) best = photo;
        }

        if (best) result.push(best);
    };

    const popups = useMemo(() => {
        const bucketSize = 128 / Math.pow(2, zoom);
        const buckets: { [x: number]: { [y: number]: PhotoT[] } } = {};

        photos.forEach((photo: PhotoT) => {
            if (!photo.coordx || !photo.coordy) return;

            if (!buckets[Math.floor(photo.coordx / bucketSize)]) buckets[Math.floor(photo.coordx / bucketSize)] = {};
            if (!buckets[Math.floor(photo.coordx / bucketSize)][Math.floor(photo.coordy / bucketSize)]) buckets[Math.floor(photo.coordx / bucketSize)][Math.floor(photo.coordy / bucketSize)] = [];

            buckets[Math.floor(photo.coordx / bucketSize)][Math.floor(photo.coordy / bucketSize)].push(photo);
        });

        const result: PhotoT[] = [];

        for (const xdesc in buckets) {
            for (const ydesc in buckets[xdesc]) {
                selectPicture(buckets[xdesc][ydesc], result, bucketSize * 1.3);
            }
        }

        return result as LocPhotoT[];
    }, [zoom, photos]);

    return <MapContainer scrollWheelZoom={true} attributionControl={false} center={center} zoom={zoom} style={mapStyle} key={"map"}>
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        {markers.map((markerLoc) => <Marker position={markerLoc} />)}
        {popups.map((photo: LocPhotoT) => (
            <Marker
                position={[photo.coordx!, photo.coordy!]}
                key={photo.id}
                icon={
                    (() => {
                        let ic = new Icon({ iconUrl: `http://localhost:4000/media/thumb_${photo.id}`, iconSize: [iconSize, iconSize] }) as any;
                        ic._createImg = () => {
                            const output = document.createElement("div");
                            const res = <img style={{ height: "inherit", width: "inherit", borderRadius: "50%", objectFit: "cover", borderStyle: "outset" }} src={`http://localhost:4000/media/thumb_${photo.id}`} />;
                            output.innerHTML = `${renderToStaticMarkup(res)}`;
                            return output;
                        };
                        return ic;
                    })()
                }
                eventHandlers={{ click: () => onClickCallback(photo) }}
            >
            </Marker>
        ))}
        <MapProperties></MapProperties>
    </MapContainer>

}