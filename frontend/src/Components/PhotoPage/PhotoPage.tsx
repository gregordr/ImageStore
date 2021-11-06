import { useEffect } from "react";
import { Typography } from "@material-ui/core";
import { useHistory } from "react-router-dom";
import { addPhotos, deletePhotos, getPhotos, getPhotosByFace, getPhotosByImage } from "../../API";
import TopRightBar from "./TopRightBar";
import { FileRejection } from "react-dropzone";
import { UploadErrorSnackbar } from "../Snackbars/UploadErrorSnackbar";
import usePhotoPage from "../Shared/usePhotoPage";

export default function PhotoPage(props: { handleDrawerToggle: () => void; drawerElement: any; searchByImageEnabled: boolean; refresh:any }) {
    const search = () => {
        const [type, term] = searchTerm

        if (type === "text") return getPhotos(term)
        if (type === "image") return getPhotosByImage(term)
        if (type === "face") return getPhotosByFace(term)
        return getPhotos("")
    }

    const upload = async (files: File[], fileRejections: FileRejection[]) => {
        if (!files) return;

        const acceptedFiles: File[] = [];

        files.forEach((file) => {
            if (file.size > maxSize) {
                fileRejections.push({ file, errors: [{ message: `File is bigger than ${maxSize / (1024 * 1024 * 1024)} GB`, code: "file-too-large" }] });
            } else {
                acceptedFiles.push(file);
            }
        });

        const snackbar = UploadErrorSnackbar.createInstance(enqueueSnackbar, closeSnackbar);
        snackbar?.begin(fileRejections);

        if (acceptedFiles.length === 0) return;

        const data = await addPhotos(acceptedFiles, enqueueSnackbar, closeSnackbar, albums);
        await fetchPhotos();
        await props.refresh();
    };

    
    const topRightBar = (id: string, buttonFunctions: any, searchByImageEnabled: boolean) => {
        return <TopRightBar id={id} buttonFunctions={buttonFunctions} searchByImageEnabled={searchByImageEnabled} />;
    };

    
    const path =  "/view"
    
    const lines = () => [
        <div> </div>,
        <Typography variant="h5" style={{ display: searchTerm[1] === "" || !searchTerm[1] ? "none" : "block", paddingLeft: 5 }}>
            Search results for {searchTerm[0] === "text" ? searchTerm[1] : `similar ${searchTerm[0]}s` }:
        </Typography>,
    ];

    const heights = () => [12, searchTerm[1] === "" || !searchTerm[1] ? 0 : 28];

    const history = useHistory();
    const imageClickHandler = (photoId: string, anySelected: any, clickHandler: any) => () => {
        if (anySelected()) {
            clickHandler(photoId)();
        } else {
            history.push(`/view/${photoId}`);
        }
    };

    const {searchTerm, topBarButtonFunctions, fetchPhotos, fetchAlbums, photos, setPhotos, albums, selected, enqueueSnackbar, closeSnackbar, maxSize, setDeleteDialogOpen, setOnDeleteDialogClose, layout} = usePhotoPage(upload, search, props.refresh, path, topRightBar, props.handleDrawerToggle, props.drawerElement, props.searchByImageEnabled, lines, heights, imageClickHandler)



    useEffect(() => {
        setPhotos([])
        fetchPhotos();
        fetchAlbums();
    }, [searchTerm]);

    (topBarButtonFunctions as any).delete = async () => {
        setOnDeleteDialogClose(() => (confirm: boolean) => async () => {
            if (confirm) {
                topBarButtonFunctions.unselect();
                await deletePhotos(selected, enqueueSnackbar, closeSnackbar);
                setPhotos(photos.filter((p) => !selected.includes(p.id)));
                fetchPhotos();
            }

            setDeleteDialogOpen(false);
        });
        setDeleteDialogOpen(true);
    }

    return (
        layout
    );
}
