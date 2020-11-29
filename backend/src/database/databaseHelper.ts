import { Pool, PoolClient } from 'pg';
const connectionString = process.env.PGSTRING;
const pool = new Pool({ connectionString, });

export class DatabaseError extends Error {
    constructor(args: string) {
        super(args);
        this.name = "DatabaseError"
    }
}

export async function transaction<T>(query: (arg0: PoolClient) => Promise<T>, useTransaction = true): Promise<T> {
    const client = await pool.connect();
    try {
        if (useTransaction)
            await client.query('BEGIN');
        const val = await query(client);
        if (useTransaction)
            await client.query('COMMIT');
        return val;
    } catch (err) {
        if (useTransaction)
            await client.query('ROLLBACK')
        if (err instanceof DatabaseError)
            throw err;
        else {
            console.log(err);
            throw new DatabaseError('Unexpected error happened and logged');
        }
    } finally {
        client.release();
    }
}

export async function requireTable(name: string, schema: string): Promise<string> {
    return transaction(async (client) => {
        // await client.query(`DROP TABLE ${name} CASCADE;`);
        const res = await client.query(`SELECT to_regclass('${name}');`)
        if (res.rows[0].to_regclass == null) {
            await client.query(`CREATE TABLE ${name} ${schema};`);
            console.log(`Created Table ${name}`)
            return name
        } else {
            console.log(`Table ${name} exists`)
            return name;
        }
    });
}
