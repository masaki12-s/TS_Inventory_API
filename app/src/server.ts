import express from 'express';
//sqlite3
import { Database } from 'sqlite3';
import dotenv from 'dotenv';
import { open } from 'sqlite';

dotenv.config();

const _port = process.env.PORT || "3000";
const port = parseInt(_port, 10);

// DB接続
async function connection() {
    const db = await open({
        filename: './db.sqlite',
        driver: Database
    });
    return db;
};

// テーブル作成
async function createTable(db: Database) {
    await db.run('CREATE TABLE IF NOT EXISTS stock (name TEXT, amount INTEGER, price INTEGER)');
}
// もしDBがなければ作成
async function init() {
    const db = await connection();
    await createTable(db);
};

init();

type Stock = {
    name: string;
    amount: number;
    price: number;
};


const app: express.Express = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

try {
    app.listen(port, () => {
      console.log(`dev server running at: http://localhost:${port}/`)
    })
  } catch (e) {
    if (e instanceof Error) {
      console.error("a")
    }
  }

app.get('/', async (req: express.Request, res: express.Response) => {{
    console.log("test");
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

