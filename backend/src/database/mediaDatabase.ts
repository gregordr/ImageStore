import { DatabaseError, requireTable, transaction } from './databaseHelper'
import { labelTable } from './labelDatabase';

export const photo = 'photo'
export const media = requireTable('media', `(${photo} varchar, UNIQUE(oid), h integer, w integer, labeled boolean default false, date integer) WITH OIDS`)

export async function getMedia(searchTerm: string, label: string): Promise<unknown[]> {
    return transaction(async (client) => {
        const result = await client.query(`SELECT OID::text as id, ${photo} as name, h as height, w as width, date as date FROM ${await media} WHERE         
        (
            ${photo} like $1::text
            OR
            OID IN
            (
                SELECT photo
                FROM ${await labelTable}
                WHERE label = $2::text
            )
        )
        ORDER BY date DESC
        ;`, [searchTerm, label]);
        return result.rows;
    });
}

export async function addMedia(name: string, heigth: number, width: number, date: number): Promise<string> {
    return transaction(async (client) => {
        const res = await client.query(`INSERT INTO ${await media} VALUES ($1::text, $2::integer, $3::integer, false, $4::integer);`, [name, heigth, width, Math.floor(date / 1000)])
        return res.oid.toString();
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