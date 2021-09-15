import { addColumn, DatabaseError, requireTable, transaction } from './databaseHelper'
import { labelTable } from './labelDatabase';

export const photo = 'photo'
export const media = (async () => {
    const media = await requireTable('media', `(${photo} varchar, UNIQUE(oid), h integer, w integer, labeled boolean default false, date integer) WITH OIDS`);
    await addColumn(media, "type", "text", true, "photo", false);
    await addColumn(media, "coordX", "float", false, null, false)
    await addColumn(media, "coordY", "float", false, null, false)
    return media;
})()

export async function getMedia(searchTerm: string, label: string): Promise<unknown[]> {
    return transaction(async (client) => {
        const result = await client.query(`SELECT OID::text as id, ${photo} as name, h as height, w as width, date as date, type as type, coordX as coordX, coordY as coordY FROM ${await media} WHERE         
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

export async function addMedia(name: string, heigth: number, width: number, date: number, type: string, coordX?: number, coordY?: number): Promise<string> {
    return transaction(async (client) => {
        const res = await client.query(`INSERT INTO ${await media} VALUES ($1::text, $2::integer, $3::integer, false, $4::integer, $5::text, $6::float, $7::float);`, [name, heigth, width, Math.floor(date / 1000), type, coordX, coordY])
        return res.oid.toString();
    });
}

export async function editMedia(oid: string, name: string, date: number, coordX?: number, coordY?: number): Promise<void> {
    return await transaction(async (client) => {
        (await client.query(`UPDATE ${await media} SET photo=$2::text, date=$3::integer, coordX=$4::float, coordY=$5::float WHERE OID = $1::OID;`, [oid, name, date, coordX, coordY]));
    })
}

export async function removeMedia(oids: string[]): Promise<number[]> {
    return transaction(async (client) => {
        const result = await client.query(`WITH VALa(aa) AS (SELECT * FROM UNNEST ($1::OID[])) SELECT OID FROM ${await media}, VALa WHERE oid = VALa.aa;`, [oids]);

        await client.query(`DELETE FROM ${await media} WHERE oid in (SELECT * FROM UNNEST($1::OID[]));`, [oids]);
        return result.rows.map((row) => row.oid);
    });
}