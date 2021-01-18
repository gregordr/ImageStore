import axios from "axios";
import JSZip from "jszip";
import { OptionsObject } from "notistack";
import React from "react";
import { AddPhotosSnackbar } from "./Components/Snackbars/AddPhotosSnackbar";
import { AddPhotosToAlbumsSnackbar } from "./Components/Snackbars/AddPhotosToAlbumsSnackbar";
import { DeletePhotosSnackbar } from "./Components/Snackbars/DeletePhotosSnackbar";
import { DownloadSnackbar } from "./Components/Snackbars/DownloadSnackbar";
import { RemovePhotosSnackbar } from "./Components/Snackbars/RemovePhotosSnackbar";
import { AlbumT, PhotoT } from "./Interfaces";

const schema = window.location.protocol;

export const baseURL = schema + "//" + window.location.hostname + (window.location.port ? ":" : "") + window.location.port + process.env.PUBLIC_URL;
console.log(baseURL);
console.log(process.env.PUBLIC_URL);
console.log(window.location.port);
axios.defaults.baseURL = baseURL;
axios.defaults.headers.post["Content-Type"] = "application/x-www-form-urlencoded";

function delay(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

const defaults = {
    photos: [
        { id: "6738313", name: "my_cat_1.jpg", height: 5458, width: 3026 },
        { id: "6738314", name: "my_cat_2.jpg", height: 2866, width: 4035 },
        { id: "6738315", name: "my_cat_3.jpg", height: 4498, width: 3374 },
        { id: "6738316", name: "my_cat_4.jpg", height: 3033, width: 2333 },
        { id: "6738317", name: "my_cat_5.jpg", height: 5472, width: 3648 },
        { id: "6738318", name: "my_cat_6.jpg", height: 3024, width: 3024 },
        { id: "6738319", name: "my_cat_7.jpg", height: 3803, width: 2853 },
        { id: "6738320", name: "my_cat_8.jpg", height: 3648, width: 5472 },
        { id: "6738321", name: "my_cat_9.jpg", height: 6016, width: 4000 },
        { id: "6738322", name: "my_cat_10.jpg", height: 2834, width: 2834 },
    ],

    albums: [{ id: 6553538, name: "My stock kitten", cover: "6738313", imagecount: 3 }],
    albumPhotos: { "6553538": ["6738313", "6738314", "6738315", "6738316", "6738317", "6738318", "6738321", "6738322", "6738319", "6738320"] },

    labels: {
        "6738313": ["cat"],
        "6738314": ["cat"],
        "6738315": ["cat", "building"],
        "6738316": ["cat"],
        "6738317": ["cat"],
        "6738318": ["cat"],
        "6738319": ["cat"],
        "6738320": ["cat", "furniture"],
        "6738321": ["cat", "nature"],
        "6738322": ["cat"],
    },
};

export async function addPhotos(
    formData: FormData,
    enqueueSnackbar?: (message: React.ReactNode, options?: OptionsObject | undefined) => string | number,
    closeSnackbar?: (key?: string | number | undefined) => void,
    albums?: AlbumT[]
) {
    const snackbar = AddPhotosSnackbar.createInstance(enqueueSnackbar, closeSnackbar, albums);
    try {
        snackbar?.begin(formData.getAll("file").length);

        await delay(200);

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

        const before: PhotoT[] = JSON.parse(sessionStorage.getItem("photos") || JSON.stringify(defaults.photos));
        const after = before.filter((p) => !photoIds.includes(p.id));
        sessionStorage.setItem("photos", JSON.stringify(after));
        await delay(300);

        snackbar?.end(photoIds, []);
    } catch (error) {
        snackbar?.end([], [error]);
        return [];
    }
}

export async function setCover(albumId: string, photoId: string) {
    const before: AlbumT[] = JSON.parse(sessionStorage.getItem("albums") || JSON.stringify(defaults.albums));
    const after = before.map((a) => (a.id != albumId ? a : { id: a.id, name: a.name, cover: photoId, imagecount: a.imagecount }));
    sessionStorage.setItem("albums", JSON.stringify(after));
    console.log(photoId);
    await delay(200);
}
export async function clearCover(albumId: string) {
    const before: AlbumT[] = JSON.parse(sessionStorage.getItem("albums") || JSON.stringify(defaults.albums));
    const after = before.map((a) => (a.id !== albumId ? a : { id: a.id, name: a.name, cover: null, imagecount: a.imagecount }));
    sessionStorage.setItem("albums", JSON.stringify(after));
    await delay(200);
}

export async function createAlbum(name: string) {
    const before: AlbumT[] = JSON.parse(sessionStorage.getItem("albums") || JSON.stringify(defaults.albums));
    const max = before.map((a) => parseInt(a.id)).reduce((max, cur) => Math.max(max, cur));
    const newInd = "" + max + 1;
    before.push({ id: newInd, name: name, cover: null, imagecount: 0 });
    sessionStorage.setItem("albums", JSON.stringify(before));

    const albumPhotos = JSON.parse(sessionStorage.getItem("albumPhotos") || JSON.stringify(defaults.albumPhotos));
    albumPhotos[newInd] = [];
    sessionStorage.setItem("albumPhotos", JSON.stringify(albumPhotos));
    await delay(200);
}

export async function deleteAlbum(albumId: string) {
    const before: AlbumT[] = JSON.parse(sessionStorage.getItem("albums") || JSON.stringify(defaults.albums));
    const after = before.filter((a) => a.id !== albumId);
    sessionStorage.setItem("albums", JSON.stringify(after));
    await delay(200);
}

export async function renameAlbum(albumId: string, newAlbumName: string) {
    const before: AlbumT[] = JSON.parse(sessionStorage.getItem("albums") || JSON.stringify(defaults.albums));
    const after = before.map((a) => (a.id !== albumId ? a : { id: a.id, name: newAlbumName, cover: a.cover, imagecount: a.imagecount }));
    sessionStorage.setItem("albums", JSON.stringify(after));
    await delay(200);
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

        const albumPhotos = JSON.parse(sessionStorage.getItem("albumPhotos") || JSON.stringify(defaults.albumPhotos));

        for (const photoId of photoIds)
            for (const albumId of albumIds) {
                if (!albumPhotos[albumId].includes(photoId)) {
                    albumPhotos[albumId].push(photoId);
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
        let albumPhotos = JSON.parse(sessionStorage.getItem("albumPhotos") || JSON.stringify(defaults.albumPhotos));

        for (const photoId of photoIds) albumPhotos[albumId] = albumPhotos[albumId].filter((p: string) => p !== photoId);

        sessionStorage.setItem("albumPhotos", JSON.stringify(albumPhotos));

        await delay(200);
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
    await delay(300);
    const before = JSON.parse(sessionStorage.getItem("labels") || JSON.stringify(defaults.labels));
    before[id] = before[id].filter((l: string) => l !== label);
    sessionStorage.setItem("labels", JSON.stringify(before));
}

export async function addLabel(ids: string[], labels: string[]) {
    await delay(300);
    const before = JSON.parse(sessionStorage.getItem("labels") || JSON.stringify(defaults.labels));
    for (const id of ids) {
        if (!before[id]) before[id] = [];
        if (!before[id].includes(labels[0])) before[id].push(labels[0]);
    }
    sessionStorage.setItem("labels", JSON.stringify(before));
}

export async function getPhotoLabels(ids: string[]) {
    const labels = JSON.parse(sessionStorage.getItem("labels") || JSON.stringify(defaults.labels));

    const found: string[] = [];

    for (const id of ids) {
        if (labels[parseInt(id)]) {
            for (const label of labels[parseInt(id)]) {
                if (!found.includes(label)) found.push(label);
            }
        }
    }

    return { status: 200, data: found };
}

export async function getAlbums(searchTerm: string) {
    const photos: PhotoT[] = JSON.parse(sessionStorage.getItem("photos") || JSON.stringify(defaults.photos));
    let before: AlbumT[] = JSON.parse(sessionStorage.getItem("albums") || JSON.stringify(defaults.albums));
    const albumPhotos = JSON.parse(sessionStorage.getItem("albumPhotos") || JSON.stringify(defaults.albumPhotos));

    if (searchTerm !== "") {
        before = before.filter((a) => {
            if (a.name.includes(searchTerm)) return true;

            return false;
        });
    }

    const after: AlbumT[] = [];

    for (const album of before) {
        let count = 0;
        for (const photo of albumPhotos[album.id]) if (photos.map((p) => p.id).includes(photo)) count++;

        after.push({ id: album.id, name: album.name, cover: album.cover, imagecount: count });
    }

    delay(200);
    return { status: 200, data: after };
}

export async function getPhotos(searchTerm: string) {
    let before: PhotoT[] = JSON.parse(sessionStorage.getItem("photos") || JSON.stringify(defaults.photos));
    const labels = JSON.parse(sessionStorage.getItem("labels") || JSON.stringify(defaults.labels));
    if (searchTerm && searchTerm !== "") {
        before = before.filter((p) => {
            if (p.name.includes(searchTerm)) return true;

            if (labels[p.id] && labels[p.id].includes(searchTerm)) return true;

            return false;
        });
    }
    delay(200);
    return { status: 200, data: before };
}

export async function getPhotosInAlbum(id: string, searchTerm: string) {
    let photos: PhotoT[] = JSON.parse(sessionStorage.getItem("photos") || JSON.stringify(defaults.photos));
    const labels = JSON.parse(sessionStorage.getItem("labels") || JSON.stringify(defaults.labels));
    const albumPhotos = JSON.parse(sessionStorage.getItem("albumPhotos") || JSON.stringify(defaults.albumPhotos));

    const included = albumPhotos[id];
    console.log(included);

    photos = photos.filter((p) => included.includes(p.id));
    console.log(searchTerm);
    if (searchTerm && searchTerm !== "") {
        photos = photos.filter((p) => {
            if (p.name.includes(searchTerm)) return true;

            if (labels[p.id] && labels[p.id].includes(searchTerm)) return true;

            return false;
        });
    }

    delay(200);
    return { status: 200, data: photos };
}
