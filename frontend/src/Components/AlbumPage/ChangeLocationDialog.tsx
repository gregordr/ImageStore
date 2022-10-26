import React, { useEffect, useState } from "react";
import Button from "@material-ui/core/Button";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogTitle from "@material-ui/core/DialogTitle";
import useMediaQuery from "@material-ui/core/useMediaQuery";
import { useTheme } from "@material-ui/core/styles";
import { TextField } from "@material-ui/core";
import { AlbumT, FolderT } from "../../Interfaces";
import { clearCover, deleteAlbum, renameAlbum } from "../../API";
import ConfirmDeleteDialog from "../Shared/ConfirmDeleteDialog";
import AutoAddDialog from "./AutoAddDialog";
import { useDeleteFolderMutation, useFoldersQuery, useRenameFolderMutation } from "../../Queries/AlbumQueries";
import { TreeItem, TreeView } from "@material-ui/lab";
import { ExpandMore, ChevronRight } from "@material-ui/icons";

export default function ChangeLocationDialog(props: { hideFolderId?: string, currentFolderId: string; open: boolean, onSelected: (folderId: string) => void }) {
    const theme = useTheme();
    const fullScreen = useMediaQuery(theme.breakpoints.down("sm"));

    const renameFolderMutation = useRenameFolderMutation()

    const query = useFoldersQuery(props.currentFolderId);

    const renderTree = (nodeList: string[], queryData: any) => (
        nodeList.filter(fid => !props.hideFolderId || props.hideFolderId !== fid).map(id => queryData.idMap[id]).map(node =>
            <TreeItem key={node.id} nodeId={node.id} label={node.name}
                onLabelClick={(event: any) => { props.onSelected(node.id); event.preventDefault() }}
            >
                {renderTree(queryData.folderMap[node.id] ?? [], queryData)}
            </TreeItem >
        )
    );

    return (
        <div>
            <Dialog fullScreen={fullScreen} open={props.open} onClose={() => props.onSelected(props.currentFolderId)} aria-labelledby="responsive-dialog-title">
                <DialogTitle id="responsive-dialog-title">Pick new location</DialogTitle>
                <DialogContent>
                    <TreeView
                        aria-label="rich object"
                        defaultCollapseIcon={<ExpandMore />}
                        defaultExpanded={["", ...query.data?.path.map(f => f.id) ?? []]}
                        defaultExpandIcon={<ChevronRight />}
                        defaultSelected={props.currentFolderId}

                    // sx={{ height: 110, flexGrow: 1, maxWidth: 400, overflowY: 'auto' }}
                    >
                        {query.data && renderTree([""], { ...query.data, idMap: { ...query.data.idMap, "": { name: "Root", id: "" } } })}
                    </TreeView>

                </DialogContent>
            </Dialog>
        </div>
    );
}
