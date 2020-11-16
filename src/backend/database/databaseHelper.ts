import { Pool, PoolClient } from 'pg';
const connectionString = process.env.PGSTRING;
const pool = new Pool({ connectionString, });

export class DatabaseError extends Error {
    constructor(...args: string[] | undefined[]) {
        super(...args);
        Object.defineProperty(this, "name", {
            value: this.constructor.name
        });
        Error.captureStackTrace(this, this.constructor);
    }
}

export async function transaction(query: (arg0: PoolClient) => Promise<unknown>): Promise<unknown> {
    const client = await pool.connect();
    try {
        client.query('BEGIN');
        const val = await query(client);
        client.query('COMMIT');
        return val;
    } catch (err) {
        client.query('ROLLBACK')
        if (err instanceof DatabaseError)
            throw err;

        console.log(err);
        throw new DatabaseError('Unexpected error happened and logged', 'test');
    } finally {
        client.release();
    }
}

export async function requireTable(name: string, schema: string): Promise<unknown> {
    return transaction(async (client) => {
        //await client.query(`DROP TABLE ${name};`);
        const res = await client.query(`SELECT to_regclass('${name}');`)
        if (res.rows[0].to_regclass == null) {
            await client.query(`CREATE TABLE ${name} ${schema} WITH OIDS;`);
            console.log(`Created Table ${name}`)
            return name
        } else {
            console.log(`Table ${name} exists`)
            return name;
        }
    });
}
