import { requireTable, transaction } from './databaseHelper'
import { media, photo } from './mediaDatabase';

export const boundingBox = 'boundingBox'
export const boundingBoxTable = (async () => {
    await media
    const name = await requireTable('boundingBoxTable', `(${photo} OID, ${boundingBox} box,
        CONSTRAINT photo_Exists FOREIGN KEY(${photo}) REFERENCES ${await media}(OID) ON DELETE CASCADE)`)
    return name;
})()

export async function getBoxes(id: string): Promise<string[]> {
    return transaction(async (client) => {
        const result = await client.query(`SELECT ${boundingBox} FROM ${await boundingBoxTable} WHERE ${photo} = $1::OID;`, [id]);
        return result.rows;
    });
}


export class Box {
    x1: number;
    y1: number;
    x2: number;
    y2: number;

    constructor(x1: number, y1: number, x2: number, y2: number) {
        this.x1 = x1
        this.y1 = y1
        this.x2 = x2
        this.y2 = y2
    }

    static fromArray(input: number[]) {
        return new Box(input[0], input[1], input[2], input[3])
    }

    static fromString(input: string) {
        const regex = /\(|\)/g;
        const array = input.replace(regex, '').split(",").map((num) => parseInt(num))
        return Box.fromArray(array)
    }

    toJSON() {
        return `((${this.x1}, ${this.y1}), (${this.x2}, ${this.y2}))`
    }
}

export async function addBoxes(id: string, boxes: Box[]): Promise<void> {
    return transaction(async (client) => {
        const result = await client.query(`INSERT INTO ${await boundingBoxTable} VALUES ($1::OID, box(UNNEST($2::text[])));`, [id, boxes.map(box => box.toJSON())]);
    });
}

export async function removeBox(id: string, box: Box): Promise<void> {
    return transaction(async (client) => {
        const result = await client.query(`DELETE FROM ${await boundingBoxTable} WHERE ${photo}=$1::OID AND ${boundingBox} = box($2::text);`, [id, box.toJSON()]);
    });
}