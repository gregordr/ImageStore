import { DatabaseError, requireTable, transaction } from './databaseHelper'

import { Pool } from 'pg';
const connectionString = process.env.PGSTRING;
const pool = new Pool({ connectionString, });

const ALBUMS = requireTable('ALBUMS', '(Album varchar)');
const ALBUM_PHOTO = requireTable('ALBUM_PHOTO', '(Album OID, Photo OID)');

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

export async function addPhotoToAlbum(albumID: string, photoID: string): Promise<unknown> {
    return await transaction(async (client) => {
        const albumCondition = (await client.query(`SELECT COUNT(OID) FROM ${await ALBUMS} WHERE OID = $1::OID;`, [albumID])).rowCount == 1;
        const photocondition = true

        const check = await client.query(`SELECT OID FROM ${await ALBUM_PHOTO} WHERE Album = $1::OID AND Photo = $2::OID;`, [albumID, photoID]);

        if (check.rowCount != 0)
            return check.rows[0].oid.toString();

        if (photocondition && albumCondition) {
            return (await client.query(`INSERT INTO ${await ALBUM_PHOTO} VALUES ($1::OID, $2::OID);`, [albumID, photoID])).oid.toString();
        } else {
            throw new DatabaseError(`This ${photocondition ? 'album' : 'photo'} does not exist`);
        }

    })
}