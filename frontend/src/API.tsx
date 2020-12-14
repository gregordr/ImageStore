import axios from "axios";
import qs from "qs";
import { PhotoT } from "./Interfaces";

axios.defaults.baseURL = "http://localhost:4000";
axios.defaults.headers.post["Content-Type"] = "application/x-www-form-urlencoded";

export async function addPhotos(formData: FormData) {
    const res = await axios.post("/media/add", formData);
    return res.data;
}

export async function deletePhotos(photoIds: string[]) {
    await Promise.all(photoIds.map(async (pid) => await axios.post("/media/delete/" + pid)));
}

export async function setCover(albumId: string, photoId: string) {
    await axios.post(`/albums/setCover/${albumId}/${photoId}`);
}
export async function clearCover(albumId: string) {
    await axios.post(`/albums/clearCover/${albumId}`);
}

export async function createAlbum(name: string) {
    await axios.post("/albums/new/" + name);
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

export async function addPhotosToAlbums(photoIds: string[], albumIds: string[]) {
    const requestBody = {
        photos: photoIds,
        albums: albumIds,
    };
    await axios.post("/albums/addPhotos", qs.stringify(requestBody));
}

export async function removePhotosFromAlbum(photoIds: string[], albumId: string) {
    await Promise.all(photoIds.map(async (pid) => await axios.post(`/albums/remove/${albumId}/${pid}`)));
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
