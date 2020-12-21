import { DatabaseError, requireTable, transaction } from './databaseHelper'
import { media, photo } from './mediaDatabase';

export const label = 'label'
export const labelTable = (async () => requireTable('labelTable', `(${photo} OID, ${label} varchar,
CONSTRAINT photo_Exists FOREIGN KEY(${photo}) REFERENCES ${await media}(OID) ON DELETE CASCADE)`).catch((err) => { console.log(err) }))();

export async function getUnlabeled(): Promise<unknown[]> {
    return transaction(async (client) => {
        const result = await client.query(`SELECT OID::text as id FROM ${await media} WHERE labeled = false;`);
        return result.rows;
    });
}
export async function getLabels(id: string): Promise<string[]> {
    return transaction(async (client) => {
        const result = await client.query(`SELECT ARRAY(SELECT label::text FROM ${await labelTable} WHERE ${photo} = $1);`, [id]);
        return result.rows[0].array;
    });
}

export async function addLabels(id: string, labels: string[]): Promise<void> {
    return transaction(async (client) => {
        await client.query(`UPDATE ${await media} SET labeled=true WHERE OID = $1::OID;`, [id])
        await client.query(`WITH VALa(aa) AS (SELECT * FROM (VALUES ($1::OID)) VALa(a)), VALb(bb) AS(SELECT * FROM UNNEST ($2::text[])) INSERT INTO ${await labelTable} SELECT * FROM valA CROSS JOIN valB ON CONFLICT DO NOTHING`, [id, labels]);
    });
}