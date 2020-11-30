import axios from "axios";

export async function setCover(albumId: string, photoId: string) {
    await axios.post(`/albums/setCover/${albumId}/${photoId}`);
}
