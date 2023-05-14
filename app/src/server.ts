import express from 'express';
//sqlite3
import dotenv from 'dotenv';
import { open, Database } from 'sqlite';
import sqlite3 from 'sqlite3';

dotenv.config();

const _port = process.env.PORT || "3000";
const port = parseInt(_port, 10);

// DB接続
async function connection() {
    const db = await open({
        filename: './db.sqlite3',
        driver: sqlite3.Database
    });
    // テーブル作成
    return db;
};

// テーブル
async function createTable(db: Database) {
    await db.run('CREATE TABLE IF NOT EXISTS stock (name STRING, amount INTEGER, sales REAL);');
    //const result = await db.get('select * from sqlite_master;');
    //console.log(result);
}

type Stock = {
    name: string;
    amount: number;
    price: number;
};

connection().then(async (db) => {
    await createTable(db);

    const app: express.Express = express();
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));

    app.listen(port, () => {
        console.log(`Example app listening at http://localhost:${port}`);
    });

    app.get('/', async (req: express.Request, res: express.Response) => {{
        console.log("test2");
    }});


    // 在庫の更新, 作成
    /**
     * POST /v1/stock
     * http resuest body
     * {
     * "name": "string" (required),
     * "amount": 0 (optional),
     * }
     * 
     * http response header
     * Location: /v1/stock/:name
     * 
     * http response body
     * same as request body
    **/
    app.post('/v1/stock', async (req: express.Request, res: express.Response) => {
        const stock = req.body;
        const db = await connection();
        await db.run('INSERT INTO stock (name, amount, price) VALUES (?, ?, ?)', [stock.name, stock.amount, stock.price]);
        res.setHeader('Location', `/v1/stock/${stock.name}`);
        res.status(201).json(stock);
    });

});