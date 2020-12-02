import { PhotoSharp, ViewArraySharp } from "@material-ui/icons";
import axios from "axios";
import qs from "qs";
import { PhotoT } from "./Interfaces";

export async function setCover(albumId: string, photoId: string) {
    await axios.post(`/albums/setCover/${albumId}/${photoId}`);
}
export async function clearCover(albumId: string) {
    await axios.post(`/albums/clearCover/${albumId}`);
}

export async function deleteAlbum(albumId: string) {
    await axios.post(`/albums/delete/${albumId}`);
}

export async function renameAlbum(albumId: string, newAlbumName: string) {
    const requestBody = {
        newAlbumName,
        albumId,
    };
    await axios.post("/albums/rename", qs.stringify(requestBody));
}

export async function download(photos: PhotoT[]) {
    if (photos.length > 1) {
        //What do I do?
    } else if (photos.length === 1) {
        const photo = photos[0];
        axios({
            url: `/media/${photo.id}`,
            method: "GET",
            responseType: "blob", // important
        }).then((response) => {
            let url = window.URL.createObjectURL(new Blob([response.data]));
            let a = document.createElement("a");
            a.href = url;
            a.download = photo.name;
            a.click();
        });
    }
}
