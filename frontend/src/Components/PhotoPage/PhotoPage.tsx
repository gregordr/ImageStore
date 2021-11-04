import { useCallback, useEffect, useState } from "react";
import { makeStyles } from "@material-ui/core/styles";
import MenuIcon from "@material-ui/icons/Menu";
import { CssBaseline, AppBar, Toolbar, IconButton, createStyles, Theme, Typography, Backdrop } from "@material-ui/core";
import TopBar from "./TopBar";
import { Route, Switch, useHistory } from "react-router-dom";
import ViewPage from "../ViewPage/ViewPage";
import AddToAlbum from "../Shared/AddToAlbum";
import { PhotoT, AlbumT } from "../../Interfaces";
import AbstractPhotoPage from "../Shared/AbstractPhotoPage";
import { addLabel, addPhotos, addPhotosToAlbums, Box, deletePhotos, download, getAlbums, getPhotoLabels, getPhotos, getPhotosByFace, getPhotosByImage } from "../../API";
import TopRightBar from "./TopRightBar";
import AutoSizer from "react-virtualized-auto-sizer";
import { useSnackbar } from "notistack";
import { useDropzone, FileRejection } from "react-dropzone";
import { UploadErrorSnackbar } from "../Snackbars/UploadErrorSnackbar";
import { CloudUpload } from "@material-ui/icons";
import AutocompleteSearchBar from "../Shared/SearchBar";
import AddLabels from "../Shared/AddLabels";
import ConfirmDeleteDialog from "../Shared/ConfirmDeleteDialog";
import usePhotoPage from "../Shared/usePhotoPage";

export default function PhotoPage(props: { handleDrawerToggle: () => void; drawerElement: any; searchByImageEnabled: boolean }) {    
    const [deletePhoto, albumDialogCallback, labelDialogCallback, getRootProps,getInputProps,searchTerm,setSearchTerm,deleteDialogOpen,onDeleteDialogClose,autocompleteOptions,setAutocompleteOptions,marked,photoSelection,hoverEventHandler,clickHandler,viewButtonFunctions,topBarButtonFunctions,anySelected,searchByImageId,searchByFace,fetchPhotos,fetchAlbums] = usePhotoPage()

    const search = () => {
        const [type, term] = searchTerm

        if (type === "text") return getPhotos(term)
        if (type === "image") return getPhotosByImage(term)
        if (type === "face") return getPhotosByFace(term)
        return getPhotos("")
    }

    useEffect(() => {
        setPhotos([])
        fetchPhotos();
        fetchAlbums();
    }, [searchTerm]);


    
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


    const imageClickHandler = (id: string) => () => {
        if (anySelected()) {
            clickHandler(id)();
        } else {
            history.push(`/view/${id}`);
        }
    };



    topBarButtonFunctions.delete = async () => {
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


    const topRightBar = (id: string, buttonFunctions: any, searchByImageEnabled: boolean) => {
        return <TopRightBar id={id} buttonFunctions={buttonFunctions} searchByImageEnabled={searchByImageEnabled} />;
    };

    const lines = [
        <div> </div>,
        <Typography variant="h5" style={{ display: searchTerm[1] === "" || !searchTerm[1] ? "none" : "block", paddingLeft: 5 }}>
            Search results for {searchTerm[0] === "text" ? searchTerm[1] : `similar ${searchTerm[0]}s` }:
        </Typography>,
    ];

    const heights = [12, searchTerm[1] === "" || !searchTerm[1] ? 0 : 28];

    return (
        <div>
            <Switch>
                <Route path="/view">
                    <ViewPage setViewId={setViewId} photos={photos} topRightBar={topRightBar} buttonFunctions={viewButtonFunctions} search={(term: string) => { setPhotos([]); setSearchBarText(term); setSearchTerm(["text", term]); }} searchByFace={searchByFace} searchByImageEnabled={props.searchByImageEnabled} ></ViewPage>
                </Route>
                <Route path="/">
                    <div {...getRootProps({ className: "dropzone" })} className={classes.root}>
                        <Backdrop
                            open={isDragActive}
                            transitionDuration={150}
                            style={{
                                zIndex: 1201,
                                backgroundColor: "#00006666",
                            }}
                        >
                            <div>
                                <CloudUpload style={{ fontSize: 200, color: "#1976d2aa" }}></CloudUpload>
                            </div>
                        </Backdrop>
                        <input {...getInputProps()} />
                        <CssBaseline />

                        <AppBar position="fixed" className={classes.appBar}>
                            <Toolbar>
                                <IconButton color="inherit" aria-label="open drawer" edge="start" onClick={props.handleDrawerToggle} className={classes.menuButton}>
                                    <MenuIcon />
                                </IconButton>
                                <TopBar
                                    searchBarText={searchBarText}
                                    setSearchBarText={setSearchBarText}
                                    autocompleteOptions={autocompleteOptions}
                                    anySelected={anySelected}
                                    buttonFunctions={topBarButtonFunctions}
                                    numSelected={() => selected.length}
                                    show={showLoadingBar}
                                />
                            </Toolbar>
                        </AppBar>

                        {props.drawerElement}

                        <main className={classes.content}>
                            <div className={classes.toolbar} />
                            {showSearchBar && (
                                <AutocompleteSearchBar
                                    options={autocompleteOptions}
                                    search={topBarButtonFunctions.search}
                                    className={classes.onlyMobile}
                                    value={searchBarText}
                                    onChange={(s: string) => setSearchBarText(s)}
                                    onRequestSearch={topBarButtonFunctions.search(searchBarText)}
                                    style={{ marginLeft: -6, borderRadius: 0, alignSelf: "flex-top" }}
                                />
                            )}
                            <div style={{ flexGrow: 1 }}>
                                <AutoSizer>
                                    {({ height, width }) => (
                                        <AbstractPhotoPage
                                            height={height - 1}
                                            width={width}
                                            photos={photos}
                                            clickHandler={clickHandler}
                                            selected={selected}
                                            anySelected={anySelected}
                                            imageClickHandler={imageClickHandler}
                                            hoverEventHandler={hoverEventHandler}
                                            searchByImageId={searchByImageId}
                                            searchByImageEnabled={props.searchByImageEnabled}
                                            marked={marked}
                                            lines={lines}
                                            heights={heights}
                                            viewId={viewId}
                                            setViewId={setViewId}
                                        />
                                    )}
                                </AutoSizer>
                            </div>
                        </main>
                    </div>
                </Route>
            </Switch>
            <AddToAlbum albums={albums} open={albumDialogOpen} setOpen={setAlbumDialogOpen} cb={albumDialogCallback} />
            <AddLabels open={labelDialogOpen} setOpen={setLabelDialogOpen} cb={labelDialogCallback}></AddLabels>
            <ConfirmDeleteDialog open={deleteDialogOpen} handleClose={onDeleteDialogClose}></ConfirmDeleteDialog>
        </div>
    );
}
