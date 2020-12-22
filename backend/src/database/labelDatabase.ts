import { requireTable, transaction } from './databaseHelper'
import { media, photo } from './mediaDatabase';

export const label = 'label'
export const labelTable = (async () => {
    await media
    const name = await requireTable('labelTable', `(${photo} OID, ${label} varchar, PRIMARY KEY(${photo}, ${label}),
CONSTRAINT photo_Exists FOREIGN KEY(${photo}) REFERENCES ${await media}(OID) ON DELETE CASCADE)`)
    return name;
})()

export async function getUnlabeled(): Promise<unknown[]> {
    return transaction(async (client) => {
        const result = await client.query(`SELECT OID::text as id FROM ${await media} WHERE labeled = false;`);
        return result.rows;
    });
}
export async function getLabels(ids: string[]): Promise<string[]> {
    return transaction(async (client) => {
        const result = await client.query(`SELECT ARRAY(SELECT DISTINCT label::text FROM ${await labelTable} WHERE ${photo} = ANY ($1));`, [ids]);
        return result.rows[0].array;
    });
}

export async function addLabelsAuto(id: string, labels: string[]): Promise<void> {
    return transaction(async (client) => {
        await client.query(`UPDATE ${await media} SET labeled=true WHERE OID = $1::OID;`, [id])
        await client.query(`WITH VALa(aa) AS (SELECT * FROM (VALUES ($1::OID)) VALa(a)), VALb(bb) AS(SELECT * FROM UNNEST ($2::text[])) INSERT INTO ${await labelTable} SELECT * FROM valA CROSS JOIN valB ON CONFLICT DO NOTHING`, [id, labels]);
    });
}

export async function addLabels(ids: string[], labels: string[]): Promise<void> {
    return transaction(async (client) => {
        await client.query(`WITH VALa(aa) AS (SELECT * FROM UNNEST ($1::OID[])), VALb(bb) AS(SELECT * FROM UNNEST ($2::text[])) INSERT INTO ${await labelTable} SELECT * FROM valA CROSS JOIN valB ON CONFLICT DO NOTHING`, [ids, labels]);
    });
}

export async function removeLabel(id: string, label: string): Promise<void> {
    return transaction(async (client) => {
        await client.query(`DELETE FROM ${await labelTable} WHERE ${photo} = $1::OID and label = $2::text;`, [id, label]);
    });
}