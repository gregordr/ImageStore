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
            formData.append("date", files[fileIdx].lastModified.toString());

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
        snackbar?.end([], [error as string]);
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
        snackbar?.end(0, [error as string]);
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
        snackbar?.end([], [], [error as string]);
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
        snackbar?.end(0, [error as string]);
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

            const takenNames: { [name: string]: true } = {};
            const findFreeName = (name: string): string => {
                if (!takenNames[name]) {
                    takenNames[name] = true;
                    return name;
                } else {
                    return findFreeName(`_CONFLICT_${Math.random().toString(5).substring(2, 15)}_` + name);
                }
            };

            const CHUNK = 10;
            for (let i = 0; i < photos.length; i += CHUNK) {
                await Promise.all(
                    photos.slice(i, i + CHUNK).map(async (photo) => {
                        const response = await axios({
                            url: `/media/${photo.id}`,
                            method: "GET",
                            responseType: "blob", // important
                        });

                        zip.file(findFreeName(photo.name), response.data);
                    })
                );
            }

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
        snackbar?.end([], [error as string]);
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

export async function getAlbumsWithMedia(photoID: string) {
    return await axios.get("albums/getAlbumsWithMedia/" + photoID);
}

export async function getAlbums(searchTerm: string) {
    return await axios.get(searchTerm === "" || !searchTerm ? "albums/all" : "albums/search/" + searchTerm);
}

export async function getPhotos(searchTerm: string) {
    return await axios.get(searchTerm === "" || !searchTerm ? "media/all" : "media/search/" + searchTerm);
}

export async function getPhotosByImage(imageId: string) {
    return await axios.get("media/searchByImage/" + imageId);
}

export async function getPhotosByFace(searchTerm: string) {
    return await axios.get(`media/searchByFace/${searchTerm}`);
}

export async function getPhotosInAlbum(id: string, searchTerm: string) {
    return await axios.get(searchTerm === "" || !searchTerm ? `albums/${id}/all` : `albums/${id}/search/${searchTerm}`);
}

export async function getPhotosByImageInAlbum(id: string, searchTerm: string) {
    return await axios.get(`albums/${id}/searchByImage/${searchTerm}`);
}

export async function getPhotosByFaceInAlbum(id: string, searchTerm: string) {
    return await axios.get(`albums/${id}/searchByFace/${searchTerm}`);
}

export async function getAutoAddLabels(albumId: string) {
    const requestBody = {
        albumId,
    };
    return await axios.post("/labels/getAutoAdd/", requestBody);
}

export async function addAutoAddLabel(albumId: string, label: string, addExisting: boolean) {
    const requestBody = {
        albumId,
        label,
        addExisting,
    };
    return await axios.post("/labels/addAutoAdd/", requestBody);
}

export async function removeAutoAddLabel(albumId: string, label: string) {
    const requestBody = {
        albumId,
        label,
    };
    return await axios.post("/labels/removeAutoAdd/", requestBody);
}

export async function checkForFeature(name: string) {
    const requestBody = {
        serviceName: name
    };
    return await axios.post("/services/check/", requestBody)
}



export class Box {
    x1: number;
    y1: number;
    x2: number;
    y2: number;

    constructor(x1: number, y1: number, x2: number, y2: number) {
        this.x1 = x1
        this.y1 = y1
        this.x2 = x2
        this.y2 = y2
    }

    static fromArray(input: number[]) {
        return new Box(input[0], input[1], input[2], input[3])
    }

    static fromString(input: string) {
        const regex = /\(|\)/g;
        const array = input.replace(regex, '').split(",").map((num) => parseInt(num))
        return Box.fromArray(array)
    }

    toJSON() {
        return `((${this.x1}, ${this.y1}), (${this.x2}, ${this.y2}))`
    }
}

export async function getBoxes(id: string) {
    const requestBody = {
        id
    };
    const res = await axios.post("/face/get", requestBody);
    const faces = res.data
    for (const face of faces) {
        face.boundingbox = Box.fromString(face.boundingbox)
    }

    return faces
}

export async function deleteBox(id: string, box: Box) {
    const requestBody = {
        id,
        box: [box.x1, box.y1, box.x2, box.y2],
    };
    const res = await axios.post("/face/remove", requestBody);
}