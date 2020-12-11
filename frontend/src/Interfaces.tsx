import { Color } from "@material-ui/lab/Alert";
import { ReactNode } from "react";

export interface AlbumT {
    id: string;
    name: string;
    imagecount: number;
    cover: string;
}

export interface PhotoT {
    id: string;
    name: string;
    height: number;
    width: number;
}

export interface Snack {
    open: boolean;
    severity: Color;
    title: string;
    body: string;
    action: ReactNode;
    autoHideDuration: number | null;
}
