import { Button } from "@material-ui/core";
import axios from "axios";
import JSZip from "jszip";
import { OptionsObject } from "notistack";
import qs from "qs";
import React from "react";
import SnackbarAction from "./Components/Shared/SnackbarAction";
import { PhotoT } from "./Interfaces";

axios.defaults.baseURL = "http://localhost:4000";
axios.defaults.headers.post["Content-Type"] = "application/x-www-form-urlencoded";

export async function addPhotos(
    formData: FormData,
    enqueueSnackbar?: (message: React.ReactNode, options?: OptionsObject | undefined) => string | number,
    closeSnackbar?: (key?: string | number | undefined) => void,
    toAlbum?: (photos: string[]) => void
) {
    try {
        const res = await axios.post("/media/add", formData);
        const photos = res.data;

        if (enqueueSnackbar && closeSnackbar && toAlbum) {
            const message = `${photos.length} element${photos.length === 1 ? " was" : "s were"} uploaded`;
            const action = SnackbarAction(
                closeSnackbar,
                toAlbum ? (
                    <Button color="inherit" onClick={() => toAlbum(photos)}>
                        Add to album
                    </Button>
                ) : null
            );
            enqueueSnackbar(message, {
                variant: "success",
                autoHideDuration: 3000,
                action,
            });
        }

        return res.data;
    } catch (error) {
        if (enqueueSnackbar && closeSnackbar && toAlbum) {
            const message = error.response && error.response.data ? error.response.data : error.toString();
            const action = SnackbarAction(closeSnackbar);
            enqueueSnackbar(message, {
                variant: "error",
                autoHideDuration: null,
                action,
            });
        }
        return [];
    }
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

        const content = await zip.generateAsync({ type: "blob" });
        let url = window.URL.createObjectURL(new Blob([content]));
        let a = document.createElement("a");
        a.href = url;
        a.download = `photos.zip`;
        a.click();
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
