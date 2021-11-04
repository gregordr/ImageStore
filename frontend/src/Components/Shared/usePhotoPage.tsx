const maxSize = parseInt(process.env.MAX_SIZE || (10 * 1024 * 1024 * 1024).toString());
const drawerWidth = 240;
const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        root: {
            display: "flex",
        },
        drawer: {
            [theme.breakpoints.up("sm")]: {
                width: drawerWidth,
                flexShrink: 0,
            },
        },
        onlyMobile: {
            [theme.breakpoints.up("md")]: {
                display: "none",
            },
        },
        appBar: {
            background: "white",
            [theme.breakpoints.up("sm")]: {
                width: `calc(100% - ${drawerWidth}px)`,
                marginLeft: drawerWidth,
            },
        },
        menuButton: {
            color: theme.palette.primary.main,
            marginRight: theme.spacing(2),
            [theme.breakpoints.up("sm")]: {
                display: "none",
            },
        },
        // necessary for content to be below app bar
        toolbar: {
            ...theme.mixins.toolbar,
            height: 64,
        },
        drawerPaper: {
            width: drawerWidth,
        },
        topleft: {
            color: "#666666",
            fontSize: "xx-large",
            display: "flex",
            "justify-content": "center",
            "align-items": "center",
            height: 64,
        },
        content: {
            flexGrow: 1,
            paddingLeft: 12,
            display: "flex",
            flexDirection: "column",
            height: "100vh",
        },
    })
);

export default function usePhotoPage() {
    //#region Hooks
    const classes = useStyles();
    const history = useHistory();

    const id = window.location.pathname.split("/")[2 + process.env.PUBLIC_URL.split("/").length];

    const [photos, setPhotos] = useState<PhotoT[]>([]);
    const [albums, setAlbums] = useState<AlbumT[]>([]);
    const [selected, setSelected] = useState<string[]>([]);
    const [selectable, setSelectable] = useState(false);
    const [albumDialogOpen, setAlbumDialogOpen] = useState(false);
    const [labelDialogOpen, setLabelDialogOpen] = useState(false);
    const [showLoadingBar, setShowLoadingBar] = useState(true);
    const [viewId, setViewId] = useState("");      

    const { enqueueSnackbar, closeSnackbar } = useSnackbar();
    const {
        getRootProps,
        open: openM,
        getInputProps,
        acceptedFiles,
        fileRejections,
        isDragActive,
    } = useDropzone({
        // Disable click and keydown behavior
        noClick: true,
        noKeyboard: true,
        accept: "image/*, video/*",
    });

    useEffect(() => {
        upload(acceptedFiles, fileRejections);
    }, [acceptedFiles, fileRejections]);

    const [showSearchBar, setShowSearchBar] = useState(false);
    const [searchBarText, setSearchBarText] = useState("");
    const [searchTerm, setSearchTerm] = useState<["text"|"image"|"face"|"none", string]>(["none", ""]);

    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [onDeleteDialogClose, setOnDeleteDialogClose] = useState<(confirm: boolean) => () => void>(() => (confirm: boolean) => () => {
        setDeleteDialogOpen(false);
        alert("Error onDeleteClose not defined");
    });

    const [autocompleteOptions, setAutocompleteOptions] = useState<string[]>([]);

    useEffect(() => {
        (async () => {
            if (photos.length === 0) setAutocompleteOptions([]);
            else setAutocompleteOptions((await getPhotoLabels(photos.map((photo) => photo.id))).data);
        })();
    }, [photos]);
    
    const [lastSelected, setLastSelected] = useState<string | undefined>();
    const [hover, setHover] = useState<string | undefined>();
    const [marked, setMarked] = useState<string[]>([]);
    const [ctrl, setCtrl] = useState(false);

    const photoSelection = useCallback(
        (inclusive: string, exclusive: string): string[] => {
            if (inclusive === exclusive) return [];
            const selection = [inclusive];
            let include = false;
            for (const photo of photos) {
                if ((photo.id === inclusive || photo.id === exclusive) && include) {
                    break;
                }

                if (include) selection.push(photo.id);

                if (photo.id === inclusive || photo.id === exclusive) {
                    include = true;
                }
            }

            return selection;
        },
        [photos]
    );

    useEffect(() => {
        document.addEventListener("keydown", (e) => {
            e.key === "Control" && setCtrl(true);
        });

        document.addEventListener("keyup", (e) => {
            e.key === "Control" && setCtrl(false);
        });

        return () => {
            document.removeEventListener("keydown", (e) => e);
            document.removeEventListener("keyup", (e) => e);
        };
    }, []);

    //#endregion hooks

    //#region handlers
    
    const hoverEventHandler = (id: string) => () => {
        setHover(id);
    };

    const clickHandler = (clickedPhotoId: string) => () => {
        let copy = selected.slice();
        let toggleSet = [clickedPhotoId];
        if (anySelected() && lastSelected && ctrl) {
            toggleSet = photoSelection(clickedPhotoId, lastSelected);
        }
        setLastSelected(clickedPhotoId);
        for (const id of toggleSet) {
            if (copy.includes(id)) copy = copy.filter((v) => v !== id);
            else copy.push(id);
        }

        setSelected(copy);
        if (copy.length === 0) {
            setSelectable(false);
        }
    };

    const viewButtonFunctions = {
        delete: async (id: string) => {
            setOnDeleteDialogClose(() => (confirm: boolean) => async () => {
                if (confirm) {
                    await deletePhoto(id);
                    await props.refresh();
                }

                setDeleteDialogOpen(false);
            });
            setDeleteDialogOpen(true);
        },
        addToAlbum: (id: string) => {
            setSelected([id]);
            setAlbumDialogOpen(true);
        },
        download: async (id: string) => {
            await download(
                photos.filter((photo) => id === photo.id),
                enqueueSnackbar,
                closeSnackbar
            );
        },
        searchByImageId,
    };

    const topBarButtonFunctions = {
        unselect: () => {
            setSelected([]);
            setSelectable(false);
        },
        upload: () => {
            openM();
        },
        settings: () => {
            //Nav to settings page
        },
        select: () => {
            setSelectable(!selectable);
        },
        addToAlbum: () => {
            setAlbumDialogOpen(true);
        },
        label: () => {
            setLabelDialogOpen(true);
        },
        download: async () => {
            topBarButtonFunctions.unselect();
            await download(
                photos.filter((photo) => selected.includes(photo.id)),
                enqueueSnackbar,
                closeSnackbar
            );
        },
        search: (s: string) => async () => {
            setSearchTerm(["text", s]);
        },
        mobileSearch: () => {
            setShowSearchBar(!showSearchBar);
        },
    };

    //#endregion handlers

    const anySelected = useCallback(() => {
        return selected.length !== 0 || selectable;
    }, [selectable, selected.length]);

    useEffect(() => {
        if (anySelected() && lastSelected && hover && ctrl) {
            setMarked(photoSelection(hover, lastSelected));
        } else {
            setMarked([]);
        }
    }, [lastSelected, hover, ctrl, anySelected, photoSelection]);

    const searchByImageId = (id: string) => {
        setSearchBarText("similar images")
        setSearchTerm(["image",id])
    }

    const searchByFace = (id: string, box: Box) => {
        setSearchBarText("similar faces")
        setSearchTerm(["face",id + "||" + box.toJSON()])
    }


    //#region API
    const fetchPhotos = async () => {
        setShowLoadingBar(true);
        const resp = await search();
        if (resp.status === 200) {
            setPhotos(resp.data);
            setShowLoadingBar(false);
        } else {
            window.alert(await resp.data);
        }
    };

    const fetchAlbums = async () => {
        const resp = await getAlbums("");
        if (resp.status === 200) {
            setAlbums(resp.data);
        } else {
            window.alert(await resp.data);
        }
    };

    const albumDialogCallback = async (albumIds: string[]) => {
        topBarButtonFunctions.unselect();
        await addPhotosToAlbums(selected, albumIds, enqueueSnackbar, closeSnackbar);
        await props.refresh();
    };

    const labelDialogCallback = async (labels: any) => {
        topBarButtonFunctions.unselect();
        await addLabel(selected, labels);
    };

    const deletePhoto = async (pid: string) => {
        setPhotos(photos.filter((p) => p.id !== pid));
        await deletePhotos([pid], enqueueSnackbar, closeSnackbar);
    };
    
    //#endregion API

    return [deletePhoto, albumDialogCallback, labelDialogCallback, getRootProps,getInputProps,searchTerm,setSearchTerm,deleteDialogOpen,onDeleteDialogClose,autocompleteOptions,setAutocompleteOptions,marked,photoSelection,hoverEventHandler,clickHandler,viewButtonFunctions,topBarButtonFunctions,anySelected,searchByImageId,searchByFace,fetchPhotos,fetchAlbums]

}

diff --git a/frontend/src/Components/AlbumPage/AlbumPhotoPage/AlbumPhotoPage.tsx b/frontend/src/Components/AlbumPage/AlbumPhotoPage/AlbumPhotoPage.tsx
