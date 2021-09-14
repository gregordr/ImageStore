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

const docker = process.env.REACT_APP_DOCKER;

const port = docker ? window.location.port : 4000;
export const baseURL = window.location.protocol + "//" + window.location.hostname + (port ? ":" : "") + port + process.env.PUBLIC_URL + (docker ? "/api" : "");

axios.defaults.baseURL = baseURL;

const SEND_SIZE = 50;
export async function addPhotos(
    files: File[],
    enqueueSnackbar?: (message: React.ReactNode, options?: OptionsObject | undefined) => string | number,
    closeSnackbar?: (key?: string | number | undefined) => void,
    albums?: AlbumT[]
) {
    const snackbar = AddPhotosSnackbar.createInstance(enqueueSnackbar, closeSnackbar, albums);
    try {
        snackbar?.begin(files.length);

        const photos: string[] = [];
        const errors: string[] = [];

        let formData = new FormData();
        for (let fileIdx = 0; fileIdx < files.length; fileIdx++) {
            formData.append("file", files[fileIdx]);

            if ((fileIdx !== 0 && fileIdx % SEND_SIZE === 0) || fileIdx === files.length - 1) {
                const res = await axios.post("/media/add", formData);
                photos.push(...(res.data.success as string[]));
                errors.push(...(res.data.errors as string[]));
                snackbar?.updateProgress(fileIdx);
                formData = new FormData();
            }
        }

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
        const res = await axios.post("/media/delete/", { ids: photoIds });
        snackbar?.end(res.data.successes, res.data.errors);
    } catch (error) {
        snackbar?.end(0, [error]);
        return [];
    }
}

export async function setCover(albumId: string, photoId: string) {
    await axios.post(`/albums/setCover/${albumId}/${photoId}`);
}
export async function clearCover(albumId: string) {
    await axios.post(`/albums/clearCover/${albumId}`);
}

export async function createAlbum(name: string) {
    return (await axios.post("/albums/new/" + name)).data;
}

export async function deleteAlbum(albumId: string) {
    await axios.post(`/albums/delete/${albumId}`);
}

export async function renameAlbum(albumId: string, newAlbumName: string) {
    const requestBody = {
        newAlbumName,
        albumId,
    };
    await axios.post("/albums/rename", requestBody);
}

export async function addPhotosToAlbums(
    photoIds: string[],
    albumIds: string[],
    enqueueSnackbar?: (message: React.ReactNode, options?: OptionsObject | undefined) => string | number,
    closeSnackbar?: (key?: string | number | undefined) => void
) {
    const requestBody = {
        photos: photoIds,
        albums: albumIds,
    };
    const snackbar = AddPhotosToAlbumsSnackbar.createInstance(enqueueSnackbar, closeSnackbar);
    try {
        snackbar?.begin(photoIds.length, albumIds.length);
        const result = await axios.post("/albums/addPhotos", requestBody);
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
        snackbar?.begin(photoIds.length);
        const requestBody = {
            photoIds,
            albumId,
        };
        const res = await axios.post(`/albums/remove`, requestBody);
        snackbar?.end(res.data, []);
    } catch (error) {
        snackbar?.end(0, [error]);
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
    const requestBody = {
        id,
        label,
    };
    await axios.post("/labels/remove", requestBody);
}

/**
 * Edit the properties of the photo with id=@param id
 */
export async function editMedia(id: string, name: string, date: number, x?: number, y?: number) {
    const requestBody = {
        name,
        date,
        x,
        y,
    };
    await axios.post("/media/edit/" + id, requestBody);
}

export async function addLabel(ids: string[], labels: string[]) {
    const requestBody = {
        ids,
        labels,
    };
    await axios.post("/labels/add", requestBody);
}

export async function getPhotoLabels(ids: string[]) {
    const requestBody = {
        ids,
    };
    return await axios.post("/labels/get/", requestBody);
}

export async function getAlbums(searchTerm: string) {
    return await axios.get(searchTerm === "" || !searchTerm ? "albums/all" : "albums/search/" + searchTerm);
}

export async function getPhotos(searchTerm: string) {
    return await axios.get(searchTerm === "" || !searchTerm ? "media/all" : "media/search/" + searchTerm);
}

export async function getPhotosInAlbum(id: string, searchTerm: string) {
    return await axios.get(searchTerm === "" || !searchTerm ? `albums/${id}/all` : `albums/${id}/search/${searchTerm}`);
}
