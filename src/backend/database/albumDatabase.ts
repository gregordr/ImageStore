import { DatabaseError, requireTable, transaction } from './databaseHelper'

const ALBUMS = requireTable('ALBUMS', '(Album varchar, UNIQUE(oid)) WITH OIDS').catch((err) => { console.log(err) });
const ALBUM_PHOTO = (async () => requireTable('ALBUM_PHOTO', `(Album OID, Photo OID, PRIMARY KEY(Album, Photo), CONSTRAINT Album_Exists FOREIGN KEY(Album) REFERENCES ${await ALBUMS}(OID) ON DELETE CASCADE) WITH OIDS`).catch((err) => { console.log(err) }))();

export async function getAlbums(searchTerm: string): Promise<unknown> {
    return transaction(async (client) => {
        const result = await client.query(`SELECT (OID, Album) FROM ${await ALBUMS} WHERE Album like $1::text;`, [searchTerm]);
        return result.rows;
    });
}

export async function addAlbum(name: string): Promise<unknown> {
    return transaction(async (client) => {
        return (await client.query(`INSERT INTO ${await ALBUMS} VALUES ($1::text);`, [name])).oid.toString();
    });
}

export async function deleteAlbum(name: string): Promise<unknown> {
    return transaction(async (client) => {
        return (await client.query(`DELETE FROM ${await ALBUMS} WHERE oid = $1::OID;`, [name])).rowCount.toString();
    });
}

export async function addPhotoToAlbum(albumID: string, photoID: string): Promise<unknown> {
    return await transaction(async (client) => {
        try {
            return (await client.query(`INSERT INTO ${await ALBUM_PHOTO} VALUES ($1::OID, $2::OID);`, [albumID, photoID])).oid.toString();
        } catch (err) {
            throw new DatabaseError('Album or photo either do not exist, or the photo is already in the album');
        }
    })
}

export async function removePhotoFromAlbum(albumID: string, photoID: string): Promise<unknown> {
    return await transaction(async (client) => {
        return (await client.query(`DELETE FROM ${await ALBUM_PHOTO} WHERE Album = $1::OID and Photo = $2::OID;`, [albumID, photoID])).rowCount.toString();
    })
}