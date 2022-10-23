import { QueryClient, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { folder } from "jszip";
import { newFolder, getFolders, getFolderFolderRelation, getFolderAlbumRelation, deleteFolder, renameFolder, putFolderIntoFolder, putAlbumIntoFolder } from "../API";
import { AlbumT, FolderT } from "../Interfaces";

export function useFoldersQuery(albums: AlbumT[], folder?: string) {
    const queryInfo = useQuery(["folders"], async () => {
        const foldersP = getFolders()
        const folderFolderArrP = getFolderFolderRelation()
        const folderAlbumArrP = getFolderAlbumRelation()

        const [folders, folderFolderArr, folderAlbumArr] = (await Promise.all([foldersP, folderFolderArrP, folderAlbumArrP])).map(o => o.data) as [FolderT[], { parentid: string, childid: string }[], { parentid: string, childid: string }[]]

        const idMap: { [key: string]: FolderT } = folders.reduce((o, f) => ({ ...o, [f.id]: f }), {})
        const folderMap: { [key: string]: string[] } = {}
        const rootSet: { [key: string]: true } = folders.reduce((o, f) => ({ ...o, [f.id]: true }), {})
        const parentMap: { [key: string]: string } = {}
        folderFolderArr.forEach(({ parentid, childid }) => {
            if (!(parentid in folderMap))
                folderMap[parentid] = []
            folderMap[parentid].push(childid)
            parentMap[childid] = parentid
            delete rootSet[childid]
        })
        const albumMap: { [key: string]: string[] } = {}
        folderAlbumArr.forEach(({ parentid, childid }) => {
            if (!(parentid in albumMap))
                albumMap[parentid] = []
            albumMap[parentid].push(childid)
        })
        folderMap[""] = Object.keys(rootSet).map((key) => key)

        return { idMap, folderMap, albumMap, parentMap }
    });

    let newData;

    if (queryInfo.data) {
        const path: FolderT[] = []
        let cur = folder && queryInfo.data.idMap[folder]
        cur = cur && queryInfo.data.idMap[queryInfo.data?.parentMap[cur.id]]
        while (cur) {
            path.push(cur)
            cur = queryInfo.data.idMap[queryInfo.data?.parentMap[cur.id]]
        }
        path.reverse()
        newData = {
            folderInfo: folder ? queryInfo.data.idMap[folder] : undefined, // current folder
            foldersToShow: queryInfo.data.folderMap[folder ?? ""]?.map(f => queryInfo.data.idMap[f]), //folders in curent folder
            albumsToShow: (!folder ? albums : albums.filter(a => queryInfo.data?.albumMap[folder ?? ""]?.includes(a.id))), //albums in current folder
            path, //path to current folder
            folderMap: queryInfo.data.folderMap, // map from folderId to child folderIds
            idMap: queryInfo.data.idMap //mapping from any id to the folder
        }
    }

    return {
        ...queryInfo,
        data: newData
    }
}

export function useNewFolderMutation() {
    const qc = useQueryClient()
    return useMutation(({ folderName, parentId }: { folderName: string, parentId?: string }) => newFolder(folderName, parentId), {
        onSuccess: (data, variables, context) => {
            qc.invalidateQueries(["folders"])
        }
    })
}

export function useDeleteFolderMutation() {
    const qc = useQueryClient()
    return useMutation(({ oid }: { oid: string }) => deleteFolder(oid), {
        onSuccess: (data, variables, context) => {
            qc.invalidateQueries(["folders"])
        }
    })
}

export function useRenameFolderMutation() {
    const qc = useQueryClient()
    return useMutation(({ oid, newName }: { oid: string, newName: string }) => renameFolder(oid, newName), {
        onSuccess: (data, variables, context) => {
            qc.invalidateQueries(["folders"])
        }
    })
}

export function useMoveFolderMutation() {
    const qc = useQueryClient()
    return useMutation(({ oid, parentOid }: { oid: string, parentOid?: string }) => putFolderIntoFolder(oid, parentOid), {
        onSuccess: (data, variables, context) => {
            qc.invalidateQueries(["folders"])
        }
    })
}

export function useMoveAlbumMutation() {
    const qc = useQueryClient()
    return useMutation(({ oid, parentOid }: { oid: string, parentOid?: string }) => putAlbumIntoFolder(oid, parentOid), {
        onSuccess: (data, variables, context) => {
            qc.invalidateQueries(["folders"])
        }
    })
}