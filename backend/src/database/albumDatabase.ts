import { DatabaseError, requireTable, transaction } from './databaseHelper'

const album = 'album'

const albums = requireTable('albums', `(${album} varchar, UNIQUE(oid), count integer DEFAULT 0, picture varchar) WITH OIDS`).catch((err) => { console.log(err) });
const album_photo = (async () => requireTable('album_photo', `(${album} OID, Photo OID, PRIMARY KEY(${album}, Photo), CONSTRAINT album_Exists FOREIGN KEY(${album}) REFERENCES ${await albums}(OID) ON DELETE CASCADE) WITH OIDS`).catch((err) => { console.log(err) }))();
//TODO: 2nd foreign key, photo

export async function getAlbums(searchTerm: string): Promise<unknown[]> {
    return transaction(async (client) => {
        const result = await client.query(`SELECT oid AS id, ${album} AS name, count, picture AS cover FROM ${await albums} WHERE ${album} like $1::text;`, [searchTerm]);
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

export async function addPhotosToAlbums(photoIDs: string[], albumIDs: string[]): Promise<(string | DatabaseError)[][]> {
    return await transaction<(string | DatabaseError)[][]>(async (client) => {
        return Promise.all(albumIDs.map((albumID: string) => Promise.all(photoIDs.map(async (photoID: string) => {
            try {
                return (await client.query(`INSERT INTO ${await album_photo} VALUES ($1::OID, $2::OID);`, [albumID, photoID])).oid.toString();
            } catch (err) {
                //console.log(err)
                return new DatabaseError('Album or photo either do not exist, or the photo is already in the album');
            }
        }
        ))));
    }, false)
}

export async function removePhotoFromAlbum(albumID: string, photoID: string): Promise<string> {
    return await transaction(async (client) => {
        return (await client.query(`DELETE FROM ${await album_photo} WHERE Album = $1::OID and Photo = $2::OID;`, [albumID, photoID])).rowCount.toString();
    })
}