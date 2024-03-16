import pkg from 'pg';
const { Pool } = pkg;

export class DatabaseConnection {
    pool;
    constructor() {
        console.log(process.env.PASSWORD);
        this.pool = new Pool({
            user: process.env.USER,
            host: process.env.HOST,
            database: process.env.DB,
            password: (process.env.PASSWORD)?.toString(),
            port: parseInt(process.env.DB_PORT as any),
        });
    }

    async connect() {
        try {
            const client = await this.pool.connect();
            console.log('Connected to the database');
            return client
        } catch (error) {
            console.log(error)
            throw new Error("Connection can not be established");

        }
    }
}

