import { resourceLimits } from 'worker_threads';
import { DatabaseError, requireTable, transaction } from './databaseHelper'
import { labelTable } from './labelDatabase';
import { media, photo } from './mediaDatabase';

export const album = 'album'
export const folder = 'folder'

export const albums = (async () => {
    await media;
    return requireTable('albums', `(${album} varchar, UNIQUE(oid), picture OID,
CONSTRAINT photo_Exists FOREIGN KEY(picture) REFERENCES ${await media}(OID) ON DELETE SET NULL
) WITH OIDS`).catch((err) => { console.log(err) })
})();

export const folders = (async () => {
    await albums;
    return requireTable('folders', `(${folder} varchar, UNIQUE(oid), picture OID, color varchar(7),
CONSTRAINT photo_Exists FOREIGN KEY(picture) REFERENCES ${await media}(OID) ON DELETE SET NULL
) WITH OIDS`).catch((err) => { console.log(err) })
})();

export const folder_folder = (async () => {
    await albums;
    return requireTable('folder_folder', `(parent oid, child oid, PRIMARY KEY(parent, child),
    CONSTRAINT parent_Exists FOREIGN KEY(parent) REFERENCES ${await folders}(OID) ON DELETE CASCADE,
    CONSTRAINT child_Exists FOREIGN KEY(child) REFERENCES ${await folders}(OID) ON DELETE CASCADE
)`).catch((err) => { console.log(err) })
})();

export const folder_album = (async () => {
    await albums;
    return requireTable('folder_album', `(parent oid, child oid, PRIMARY KEY(parent, child),
    CONSTRAINT parent_Exists FOREIGN KEY(parent) REFERENCES ${await folders}(OID) ON DELETE CASCADE,
    CONSTRAINT child_Exists FOREIGN KEY(child) REFERENCES ${await albums}(OID) ON DELETE CASCADE
)`).catch((err) => { console.log(err) })
})();

export const album_photo = (async () => requireTable('album_photo', `(${album} OID, Photo OID, PRIMARY KEY(${album}, Photo), 
CONSTRAINT album_Exists FOREIGN KEY(${album}) REFERENCES ${await albums}(OID) ON DELETE CASCADE,
CONSTRAINT photo_Exists FOREIGN KEY(Photo) REFERENCES ${await media}(OID) ON DELETE CASCADE
) WITH OIDS`).catch((err) => { console.log(err) }))();

export async function getFolders(): Promise<unknown[]> {
    return transaction(async (client) => {
        const result = await client.query(`
            SELECT
            oid as id,
            ${folder} as name,
            picture as cover,
            color as color
            FROM ${await folders};
        `, []);

        return result.rows
    });
}

export async function getFolderFolderRelation(): Promise<unknown[]> {
    return transaction(async (client) => {
        const result = await client.query(`SELECT 
        ${await folder_folder}.child as childId,
        parent as parentId
        FROM ${await folder_folder};`);
        return result.rows;
    }, true);
}

export async function getFolderAlbumRelation(): Promise<unknown[]> {
    return transaction(async (client) => {
        const result = await client.query(`SELECT 
        child as childId,
        parent as parentId
        FROM ${await folder_album};`);
        return result.rows;
    }, true);
}

export async function renameFolder(oid: string, newName: string) {
    return await transaction(async (client) => {
        return (await client.query(`UPDATE ${await folders} SET folder=$2::text WHERE OID = $1::OID;`, [oid, newName])).rowCount.toString();
    })
}

export async function deleteFolder(oid: string): Promise<string> {
    return transaction(async (client) => {
        return (await client.query(`DELETE FROM ${await folders} WHERE oid = $1::OID;`, [oid])).rowCount.toString();
    });
}

export async function addFolder(name: string, parentId?: string): Promise<unknown> {
    return transaction(async (client) => {
        const oid = (await client.query(`INSERT INTO ${await folders}
        VALUES ($1::text);`, [name])).oid.toString();

        if (parentId) {
            await client.query(`INSERT INTO ${await folder_folder}
            VALUES($1::oid, $2::oid);`, [parentId, oid])
        }
        return oid;
    }, true)
}

export async function putFolderIntoFolder(oid: string, parentId?: string): Promise<unknown> {
    return transaction(async (client) => {
        await client.query(`DELETE FROM ${await folder_folder} WHERE child = $1::OID;`, [oid])
        if (parentId)
            await client.query(`INSERT INTO ${await folder_folder}
                VALUES($1::oid, $2::oid);`, [parentId, oid])
    }, true)
}

export async function putAlbumIntoFolder(oid: string, parentId: string): Promise<unknown> {
    return transaction(async (client) => {
        return await client.query(`INSERT INTO ${await folder_album}
        VALUES($1::oid, $2::oid);`, [parentId, oid])
    }, true)
}

export async function getAlbums(searchTerm: string): Promise<unknown[]> {
    return transaction(async (client) => {
        const result = await client.query(`
        SELECT 
        oid AS id,
        ${album} AS name,
        COALESCE(
            picture, (
                SELECT ${await album_photo}.${photo} FROM ${await album_photo} 
                JOIN ${await media} ON ${await media}.oid=${await album_photo}.${photo}
                WHERE ${await albums}.oid=album
                ORDER BY date DESC 
                LIMIT 1
            )
        ) AS cover,
        (
            SELECT COUNT(*)
            FROM ${await album_photo}
            WHERE ${await albums}.oid = ${await album_photo}.${album}
        )::integer AS imageCount
        FROM ${await albums} 
        WHERE ${album} like $1::text
        ORDER BY name;`,
            [searchTerm]);
        return result.rows;
    });
}

export async function addAlbum(name: string, parentId?: String): Promise<string> {
    return transaction(async (client) => {
        const oid = (await client.query(`INSERT INTO ${await albums} VALUES ($1::text);`, [name])).oid.toString();

        if (parentId) {
            await client.query(`INSERT INTO ${await folder_album}
            VALUES($1::oid, $2::oid);`, [parentId, oid])
        }

        return oid;
    });
}

export async function deleteAlbum(name: string): Promise<string> {
    return transaction(async (client) => {
        return (await client.query(`DELETE FROM ${await albums} WHERE oid = $1::OID;`, [name])).rowCount.toString();
    });
}

export function getAlbumsWithMedia(photoID: string): Promise<unknown[]> {
    return transaction(async (client) => {
        const result = await client.query(`SELECT ${await albums}.OID as id, ${await albums}.${album} as name,
        COALESCE(
            picture, (
                SELECT ${await album_photo}.${photo} FROM ${await album_photo} 
                JOIN ${await media} ON ${await media}.oid=${await album_photo}.${photo}
                WHERE ${await albums}.oid=album
                ORDER BY date DESC
                LIMIT 1
            )
        ) AS cover
        , (
            SELECT COUNT(*)
            FROM ${await album_photo}
            WHERE ${album} = ${await albums}.OID
        ) as imagecount
        FROM ${await album_photo}
        JOIN ${await albums} ON ${await albums}.OID = ${await album_photo}.${album}
        WHERE ${photo} = $1::OID
        ;`, [photoID]);
        return result.rows;
    });
}

export function getMediaInAlbum(album: string, searchTerm: string, label: string): Promise<unknown[]> {
    return transaction(async (client) => {
        const result = await client.query(`SELECT OID::text as id, ${photo} as name, h as height, w as width, date as date, type as type, coordX as coordX, coordY as coordY FROM ${await media} WHERE 
        (
            ${photo} like $1::text
            OR
            OID IN
            (
                SELECT photo
                FROM ${await labelTable}
                WHERE label = $3::text
            )
        ) 
        AND OID IN
        (
            SELECT photo
            FROM ${await album_photo}
            WHERE Album = $2::OID
        )
        ORDER BY date DESC
        ;`, [searchTerm, album, label]);
        return result.rows;
    });
}

export async function addPhotosToAlbums(photoIDs: string[], albumIDs: string[]): Promise<(number | DatabaseError)> {
    return await transaction<(number | DatabaseError)>(async (client) => {
        try {
            return (await client.query(`WITH VALa (aa) AS (SELECT * FROM UNNEST ($1::OID[])), VALb(bb) AS(SELECT * FROM UNNEST ($2::OID[])) INSERT INTO ${await album_photo} SELECT * FROM valA CROSS JOIN valB ON CONFLICT DO NOTHING`, [albumIDs, photoIDs])).rowCount;
        } catch (err) {
            console.log(err)
            return new DatabaseError('Album or photo either do not exist');
        }
    }, false)
}

export async function removePhotosFromAlbum(albumID: string, photoIDs: string[]): Promise<string> {
    return await transaction(async (client) => {
        return (await client.query(`DELETE FROM ${await album_photo} WHERE Album = $1::OID and Photo in (SELECT * FROM UNNEST($2::OID[]));`, [albumID, photoIDs])).rowCount.toString();
    })
}

export async function setCover(albumID: string, photoID: string | null) {
    return await transaction(async (client) => {
        return (await client.query(`UPDATE ${await albums} SET picture=$2::OID WHERE OID = $1::OID;`, [albumID, photoID])).rowCount.toString();
    })
}

export async function rename(albumID: string, newName: string) {
    return await transaction(async (client) => {
        return (await client.query(`UPDATE ${await albums} SET album=$2::text WHERE OID = $1::OID;`, [albumID, newName])).rowCount.toString();
    })
}