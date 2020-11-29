import { DatabaseError, requireTable, transaction } from './databaseHelper'

export const photo = 'photo'
export const media = requireTable('media', `(${photo} varchar, UNIQUE(oid), h integer, w integer) WITH OIDS`).catch((err) => { console.log(err) });
//Todo: photos instead of media?

export async function getMedia(searchTerm: string): Promise<unknown[]> {
    return transaction(async (client) => {
        const result = await client.query(`SELECT OID as id, ${photo} as name, h as height, w as width FROM ${await media} WHERE ${photo} like $1::text;`, [searchTerm]);
        return result.rows;
    });
}

export async function addMedia(name: string, heigth: number, width: number): Promise<number> {
    return transaction(async (client) => {
        const res = await client.query(`INSERT INTO ${await media} VALUES ($1::text, $2::integer, $3::integer);`, [name, heigth, width])
        return res.oid;
    });
}

export async function removeMedia(oid: string): Promise<number> {
    return transaction(async (client) => {
        const result = await client.query(`SELECT OID FROM ${await media} WHERE oid = $1::oid;`, [oid]);
        if (result.rowCount == 0)
            throw new DatabaseError('This file does not exist');

        await client.query(`DELETE FROM ${await media} WHERE oid = $1::oid;`, [oid]);
        return result.rows[0].oid
    });
}