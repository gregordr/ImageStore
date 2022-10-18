import { useQuery } from "@tanstack/react-query";
import { getPhotos } from "../API";

export function useAllPhotosQuery() {
    return useQuery(["photos"], () => getPhotos(""));
}