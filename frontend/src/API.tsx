import axios from "axios";
import JSZip from "jszip";
import { OptionsObject } from "notistack";
import qs from "qs";
import React from "react";
import { AddPhotosSnackbar } from "./Components/Snackbars/AddPhotosSnackbar";
import { AddPhotosToAlbumsSnackbar } from "./Components/Snackbars/AddPhotosToAlbumsSnackbar";
import { DeletePhotosSnackbar } from "./Components/Snackbars/DeletePhotosSnackbar";
import { DownloadSnackbar } from "./Components/Snackbars/DownloadSnackbar";
import { RemovePhotosSnackbar } from "./Components/Snackbars/RemovePhotosSnackbar";
import { AlbumT, PhotoT } from "./Interfaces";

console.log(window.location.hostname)
export const baseURL = "http://" + window.location.hostname + ":4000"
console.log(baseURL)
axios.defaults.baseURL = baseURL;
axios.defaults.headers.post["Content-Type"] = "application/x-www-form-urlencoded";

function delay(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

const defaults = {
    photos: [{ id: "6596031", name: "20170729_165718.jpg", height: 3024, width: 4032 }, { id: "6596034", name: "20170729_170213.jpg", height: 4032, width: 3024 }, { id: "6596036", name: "20170729_170841.jpg", height: 3024, width: 4032 }, { id: "6596037", name: "20170729_194019.jpg", height: 4032, width: 3024 }, { id: "6596038", name: "20170729_204048.jpg", height: 3024, width: 4032 }, { id: "6596039", name: "20170729_204055.jpg", height: 3024, width: 4032 }, { id: "6596040", name: "20170729_204058.jpg", height: 3024, width: 4032 }, { id: "6596041", name: "20170729_213432.jpg", height: 3024, width: 4032 }, { id: "6596042", name: "20170729_213434.jpg", height: 3024, width: 4032 }, { id: "6596043", name: "20170729_213615.jpg", height: 3024, width: 4032 }, { id: "6596044", name: "20170729_213656.jpg", height: 3024, width: 4032 }, { id: "6596045", name: "20170729_213659.jpg", height: 4032, width: 3024 }, { id: "6596046", name: "20170729_213701.jpg", height: 4032, width: 3024 }, { id: "6596047", name: "20170729_213729.jpg", height: 4032, width: 3024 }, { id: "6596048", name: "20170729_213818.jpg", height: 3024, width: 4032 }],

    albums: [{ id: 6553538, name: "My kitten", cover: 6596031, imagecount: 3 }],
    albumPhotos: { 6553538: ["6596031", "6596034", "6596036"] },

    labels: { 6596031: ["one", "tw"] }

}

export async function addPhotos(
    formData: FormData,
    enqueueSnackbar?: (message: React.ReactNode, options?: OptionsObject | undefined) => string | number,
    closeSnackbar?: (key?: string | number | undefined) => void,
    albums?: AlbumT[]
) {
    const snackbar = AddPhotosSnackbar.createInstance(enqueueSnackbar, closeSnackbar, albums);
    try {
        snackbar?.begin(formData.getAll("file").length);

        await delay(200)

        const photos: string[] = [];
        const errors: string[] = ["You cannot upload photos to the demo page, please download the self-hosted version"];

        snackbar?.end(photos, errors);

        return photos;
    } catch (error) {
        snackbar?.end([], [error]);
        return [];
    }
}

export async function deletePhotos(
    photoIds: string[],
    enqueueSnackbar?: (message: React.ReactNode, options?: OptionsObject | undefined) => string | number,
    closeSnackbar?: (key?: string | number | undefined) => void
) {
    const snackbar = DeletePhotosSnackbar.createInstance(enqueueSnackbar, closeSnackbar);
    try {
        snackbar?.begin(photoIds.length);

        const before: PhotoT[] = JSON.parse(sessionStorage.getItem("photos") || JSON.stringify(defaults.photos))
        const after = before.filter(p => !photoIds.includes(p.id))
        sessionStorage.setItem("photos", JSON.stringify(after));
        await delay(300)

        snackbar?.end(photoIds, []);
    } catch (error) {
        snackbar?.end([], [error]);
        return [];
    }
}

export async function setCover(albumId: string, photoId: string) {
    const before: AlbumT[] = JSON.parse(sessionStorage.getItem("albums") || JSON.stringify(defaults.albums))
    const after = before.map(a => a.id !== albumId ? a : { id: a.id, name: a.name, cover: photoId, imagecount: a.imagecount })
    sessionStorage.setItem("albums", JSON.stringify(after));
    await delay(200)
}
export async function clearCover(albumId: string) {
    const before: AlbumT[] = JSON.parse(sessionStorage.getItem("albums") || JSON.stringify(defaults.albums))
    const after = before.map(a => a.id !== albumId ? a : { id: a.id, name: a.name, cover: null, imagecount: a.imagecount })
    sessionStorage.setItem("albums", JSON.stringify(after));
    await delay(200)
}

export async function createAlbum(name: string) {
    const before: AlbumT[] = JSON.parse(sessionStorage.getItem("albums") || JSON.stringify(defaults.albums))
    const max = before.map(a => parseInt(a.id)).reduce((max, cur) => Math.max(max, cur))
    before.push({ id: "" + max + 1, name: name, cover: null, imagecount: 0 })
    sessionStorage.setItem("albums", JSON.stringify(before));

    const albumPhotos = JSON.parse(sessionStorage.getItem("albumPhotos") || JSON.stringify(defaults.albumPhotos))
    albumPhotos[max + 1] = []
    sessionStorage.setItem("albumPhotos", JSON.stringify(albumPhotos));
    await delay(200)
}

export async function deleteAlbum(albumId: string) {
    const before: AlbumT[] = JSON.parse(sessionStorage.getItem("albums") || JSON.stringify(defaults.albums))
    const after = before.filter(a => a.id !== albumId)
    sessionStorage.setItem("albums", JSON.stringify(after));
    await delay(200)
}

export async function renameAlbum(albumId: string, newAlbumName: string) {
    const before: AlbumT[] = JSON.parse(sessionStorage.getItem("albums") || JSON.stringify(defaults.albums))
    const after = before.map(a => a.id !== albumId ? a : { id: a.id, name: newAlbumName, cover: a.cover, imagecount: a.imagecount })
    sessionStorage.setItem("albums", JSON.stringify(after));
    await delay(200)
}

export async function addPhotosToAlbums(
    photoIds: string[],
    albumIds: string[],
    enqueueSnackbar?: (message: React.ReactNode, options?: OptionsObject | undefined) => string | number,
    closeSnackbar?: (key?: string | number | undefined) => void
) {
    const snackbar = AddPhotosToAlbumsSnackbar.createInstance(enqueueSnackbar, closeSnackbar);
    try {
        snackbar?.begin(photoIds.length, albumIds.length);


        const albumPhotos = JSON.parse(sessionStorage.getItem("albumPhotos") || JSON.stringify(defaults.albumPhotos))

        for (const photoId of photoIds)
            for (const albumId of albumIds) {
                if (!albumPhotos[albumId].includes(photoId)) {
                    albumPhotos[albumId].push(photoId)
                }
            }

        sessionStorage.setItem("albumPhotos", JSON.stringify(albumPhotos));

        snackbar?.end(photoIds, albumIds, []);
    } catch (error) {
        snackbar?.end([], [], [error]);
    }
}

export async function removePhotosFromAlbum(
    photoIds: string[],
    albumId: string,
    enqueueSnackbar?: (message: React.ReactNode, options?: OptionsObject | undefined) => string | number,
    closeSnackbar?: (key?: string | number | undefined) => void
) {
    const snackbar = RemovePhotosSnackbar.createInstance(enqueueSnackbar, closeSnackbar);
    try {

        let albumPhotos = JSON.parse(sessionStorage.getItem("albumPhotos") || JSON.stringify(defaults.albumPhotos))

        for (const photoId of photoIds)
            albumPhotos[albumId] = albumPhotos[albumId].filter((p: string) => p !== photoId)

        sessionStorage.setItem("albumPhotos", JSON.stringify(albumPhotos));

        await delay(200)
        snackbar?.end(photoIds, []);
    } catch (error) {
        snackbar?.end([], [error]);
    }
}

export async function download(
    photos: PhotoT[],
    enqueueSnackbar?: (message: React.ReactNode, options?: OptionsObject | undefined) => string | number,
    closeSnackbar?: (key?: string | number | undefined) => void
) {
    if (photos.length === 0) return;
    const snackbar = DownloadSnackbar.createInstance(enqueueSnackbar, closeSnackbar);

    try {
        snackbar?.begin(photos.length);
        let content: Blob;
        let name: string;
        if (photos.length === 1) {
            const photo = photos[0];
            const response = await axios({
                url: `/media/${photo.id}`,
                method: "GET",
                responseType: "blob", // important
            });

            content = response.data;
            name = photo.name;
        } else {
            const zip = new JSZip();
            await Promise.all(
                photos.map(async (photo) => {
                    const response = await axios({
                        url: `/media/${photo.id}`,
                        method: "GET",
                        responseType: "blob", // important
                    });

                    zip.file(photo.name, response.data);
                })
            );

            content = await zip.generateAsync({ type: "blob" });
            name = `photos.zip`;
        }

        const url = window.URL.createObjectURL(new Blob([content]));
        const a = document.createElement("a");
        a.href = url;
        a.download = name;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        snackbar?.end([], []);
    } catch (error) {
        snackbar?.end([], [error]);
    }
}

export async function removeLabel(id: string, label: string) {
    await delay(300)
    const before = JSON.parse(sessionStorage.getItem("labels") || JSON.stringify(defaults.labels))
    before[id] = before[id].filter((l: string) => l !== label)
    sessionStorage.setItem("labels", JSON.stringify(before));
}

export async function addLabel(ids: string[], labels: string[]) {
    await delay(300)
    const before = JSON.parse(sessionStorage.getItem("labels") || JSON.stringify(defaults.labels))
    for (const id of ids) {
        if (!before[id])
            before[id] = []
        if (!before[id].includes(labels[0]))
            before[id].push(labels[0])
    }
    sessionStorage.setItem("labels", JSON.stringify(before));
}

export async function getPhotoLabels(ids: string[]) {
    const labels = JSON.parse(sessionStorage.getItem("labels") || JSON.stringify(defaults.labels))

    const found: string[] = []

    for (const id of ids) {
        if (labels[parseInt(id)]) {
            for (const label of labels[parseInt(id)]) {
                if (!found.includes(label))
                    found.push(label)
            }
        }
    }

    return { "status": 200, "data": found }
}

export async function getAlbums(searchTerm: string) {
    let before: AlbumT[] = JSON.parse(sessionStorage.getItem("albums") || JSON.stringify(defaults.albums))
    if (searchTerm !== "") {
        before = before.filter(a => {
            if (a.name.includes(searchTerm))
                return true;

            return false;
        })
    }
    delay(200)
    return { status: 200, data: before }
}

export async function getPhotos(searchTerm: string) {
    let before: PhotoT[] = JSON.parse(sessionStorage.getItem("photos") || JSON.stringify(defaults.photos))
    const labels = JSON.parse(sessionStorage.getItem("labels") || JSON.stringify(defaults.labels))
    if (searchTerm !== "") {
        before = before.filter(p => {
            if (p.name.includes(searchTerm))
                return true;

            if (labels[p.id] && labels[p.id].includes(searchTerm))
                return true

            return false;
        })
    }
    delay(200)
    return { status: 200, data: before }
}

export async function getPhotosInAlbum(id: string, searchTerm: string) {
    let photos: PhotoT[] = JSON.parse(sessionStorage.getItem("photos") || JSON.stringify(defaults.photos))
    const albumPhotos = JSON.parse(sessionStorage.getItem("albumPhotos") || JSON.stringify(defaults.albumPhotos))

    const included = albumPhotos[id]
    console.log(included)

    photos = photos.filter(p => included.includes(p.id))

    if (searchTerm !== "") {
        photos = photos.filter(p => {
            if (p.name.includes(searchTerm))
                return true;

            return false;
        })
    }
    delay(200)
    return { status: 200, data: photos }
}