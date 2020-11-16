import { requireTable } from './databaseHelper'
import { Client } from 'pg';

const conString = process.env.PGSTRING;

const ALBUMS = requireTable('ALBUMS', '(Album varchar UNIQUE)');
const ALBUM_PHOTO = requireTable('ALBUM_PHOTO', '(Album varchar, Photo varchar');

const client = new Client(conString);
const clientConnection = client.connect();

export async function getAlbums(searchTerm: string): Promise<string | unknown> {
    await clientConnection;
    return (await client.query(`SELECT * FROM ${await ALBUMS};`)).rows;
}

export async function addAlbum(name: string): Promise<string | unknown> {
    await clientConnection;
    return client.query(`INSERT INTO ${await ALBUMS} VALUES ($2::text);`, [name]);
}
