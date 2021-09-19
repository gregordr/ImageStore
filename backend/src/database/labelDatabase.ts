import { album, albums, album_photo } from './albumDatabase';
import { requireTable, transaction } from './databaseHelper'
import { media, photo } from './mediaDatabase';

export const label = 'label'
export const labelTable = (async () => {
    await media
    const name = await requireTable('labelTable', `(${photo} OID, ${label} varchar, PRIMARY KEY(${photo}, ${label}),
CONSTRAINT photo_Exists FOREIGN KEY(${photo}) REFERENCES ${await media}(OID) ON DELETE CASCADE)`)
    return name;
})()

export const autoAddLabelTable = (async () => {
    await albums
    const name = await requireTable('autoAddLabelTable', `(${album} OID, ${label} varchar, PRIMARY KEY(${album}, ${label}),
    CONSTRAINT album_Exists FOREIGN KEY(${album}) REFERENCES ${await albums}(OID) ON DELETE CASCADE)`)

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


        await client.query(`WITH VALa(photo) AS (SELECT * FROM (VALUES ($1::OID)) VALa(a)), VALb(bb) AS(SELECT * FROM UNNEST ($2::text[])) INSERT INTO ${await album_photo} SELECT ${album}, ${photo} AS Photo FROM valA CROSS JOIN valB JOIN ${await autoAddLabelTable} ON bb=${label} ON CONFLICT DO NOTHING`, [id, labels]);
    });
}

export async function addLabels(ids: string[], labels: string[]): Promise<void> {
    return transaction(async (client) => {
        await client.query(`WITH VALa(aa) AS (SELECT * FROM UNNEST ($1::OID[])), VALb(bb) AS(SELECT * FROM UNNEST ($2::text[])) INSERT INTO ${await labelTable} SELECT * FROM valA CROSS JOIN valB ON CONFLICT DO NOTHING`, [ids, labels]);

        await client.query(`WITH VALa(photo) AS (SELECT * FROM UNNEST ($1::OID[])), VALb(bb) AS(SELECT * FROM UNNEST ($2::text[])) INSERT INTO ${await album_photo} SELECT ${album}, ${photo} AS Photo FROM valA CROSS JOIN valB JOIN ${await autoAddLabelTable} ON bb=${label} ON CONFLICT DO NOTHING`, [ids, labels]);
    });
}

export async function removeLabel(id: string, label: string): Promise<void> {
    return transaction(async (client) => {
        await client.query(`DELETE FROM ${await labelTable} WHERE ${photo} = $1::OID and label = $2::text;`, [id, label]);
    });
}

export async function getAutoAddLabels(albumId: string): Promise<string[]> {
    return transaction(async (client) => {
        const res = await client.query(`SELECT ${label} FROM ${await autoAddLabelTable} WHERE ${album} = $1::OID`, [albumId])
        return res.rows.map((row) => row.label)
    })
}

export async function addAutoAddLabel(albumId: string, addLabel: string, addExisting: boolean): Promise<void> {
    return transaction(async (client) => {
        await client.query(`INSERT INTO ${await autoAddLabelTable} VALUES ($1::OID, $2::text)`, [albumId, addLabel])

        if (addExisting) {
            await client.query(`INSERT INTO ${await album_photo} SELECT $1::OID as ${album}, photo FROM ${await labelTable} WHERE label = $2::text ON CONFLICT DO NOTHING`, [albumId, addLabel])
        }
    })
}

export async function removeAutoAddLabel(albumId: string, rmLabel: string): Promise<void> {
    return transaction(async (client) => {
        await client.query(`DELETE FROM ${await autoAddLabelTable} WHERE ${album}=$1::OID AND ${label} = $2::text`, [albumId, rmLabel])
    })
}

