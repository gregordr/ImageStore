import { requireTable } from './databaseHelper'

import { Client } from 'pg';
const conString = process.env.PGSTRING;

const ALBUMS = requireTable('ALBUMS', '(Album varchar UNIQUE)');
const ALBUM_PHOTO = requireTable('ALBUM_PHOTO', '(Album varchar, Photo varchar');

var client = new Client(conString);
client.connect();

export async function getAlbums(searchTerm: string) {
    return (await client.query(`SELECT * FROM ${await ALBUMS};`)).rows;
}

export async function addAlbum(name: string) {
    return client.query(`INSERT INTO ${await ALBUMS} VALUES ($1::text);`, [name]);
}