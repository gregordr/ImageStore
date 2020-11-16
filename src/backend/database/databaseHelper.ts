import { Client } from 'pg';
const conString = process.env.PGSTRING;

var client = new Client(conString);
client.connect();

async function requireTable(name: string, schema: string): Promise<string | undefined> {
    try {
        let res = await client.query(`SELECT to_regclass('${name}');`)
        if (res.rows[0].to_regclass == null) {
            await client.query(`CREATE TABLE ${name} ${schema};`);
            console.log(`Created Table ${name}`)
            return name
        } else {
            console.log(`Table ${name} exists`)
            return name;
        }
    } catch (err) {
        console.log(err)
        return undefined;
    }

}

export { requireTable }
