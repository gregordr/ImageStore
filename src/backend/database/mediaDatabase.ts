import { DatabaseError, requireTable, transaction } from './databaseHelper'

const photo = 'photo'
const media = requireTable('media', `(${photo} varchar, UNIQUE(oid)) WITH OIDS`).catch((err) => { console.log(err) });

export async function getMedia(searchTerm: string): Promise<unknown[]> {
    return transaction(async (client) => {
        const result = await client.query(`SELECT (OID, ${photo}) FROM ${await media} WHERE ${photo} like $1::text;`, [searchTerm]);
        return result.rows;
    });
}

export async function addMedia(name: string): Promise<string> {
    return transaction(async (client) => {
        return (await client.query(`INSERT INTO ${await media} VALUES ($1::text);`, [name])).oid.toString();
    });
}

export async function removeMedia(oid: string): Promise<string> {
    return transaction(async (client) => {
        const result = await client.query(`SELECT * FROM ${await media} WHERE oid = $1::oid;`, [oid]);
        if (result.rowCount == 0)
            throw new DatabaseError('This file does not exist');

        await client.query(`DELETE FROM ${await media} WHERE oid = $1::oid;`, [oid]);

        return result.rows[0].photo
    });
}