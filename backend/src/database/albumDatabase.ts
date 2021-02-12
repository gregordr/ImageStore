import { DatabaseError, requireTable, transaction } from './databaseHelper'
import { labelTable } from './labelDatabase';
import { media, photo } from './mediaDatabase';

const album = 'album'

const albums = (async () => requireTable('albums', `(${album} varchar, UNIQUE(oid), picture OID,
CONSTRAINT photo_Exists FOREIGN KEY(picture) REFERENCES ${await media}(OID) ON DELETE SET NULL
) WITH OIDS`).catch((err) => { console.log(err) }))();
//add foreign key photo
const album_photo = (async () => requireTable('album_photo', `(${album} OID, Photo OID, PRIMARY KEY(${album}, Photo), 
CONSTRAINT album_Exists FOREIGN KEY(${album}) REFERENCES ${await albums}(OID) ON DELETE CASCADE,
CONSTRAINT photo_Exists FOREIGN KEY(Photo) REFERENCES ${await media}(OID) ON DELETE CASCADE
) WITH OIDS`).catch((err) => { console.log(err) }))();
//TODO: 2nd foreign key, photo

export async function getAlbums(searchTerm: string): Promise<unknown[]> {
    return transaction(async (client) => {
        const result = await client.query(`SELECT oid AS id, ${album} AS name, picture AS cover, (
            SELECT COUNT(*)
            FROM ${await album_photo}
            WHERE ${await albums}.oid = ${await album_photo}.${album}
        )::integer AS imageCount FROM ${await albums} WHERE ${album} like $1::text
        ORDER BY name;`, [searchTerm]);
        return result.rows;
    });
}

export async function addAlbum(name: string): Promise<string> {
    return transaction(async (client) => {
        return (await client.query(`INSERT INTO ${await albums} VALUES ($1::text);`, [name])).oid.toString();
    });
}

export async function deleteAlbum(name: string): Promise<string> {
    return transaction(async (client) => {
        return (await client.query(`DELETE FROM ${await albums} WHERE oid = $1::OID;`, [name])).rowCount.toString();
    });
}


export async function getMediaInAlbum(album: string, searchTerm: string, label: string): Promise<unknown[]> {
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

export async function removePhotoFromAlbum(albumID: string, photoID: string): Promise<string> {
    return await transaction(async (client) => {
        return (await client.query(`DELETE FROM ${await album_photo} WHERE Album = $1::OID and Photo = $2::OID;`, [albumID, photoID])).rowCount.toString();
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