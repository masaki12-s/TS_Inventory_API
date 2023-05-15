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
    
    // 在庫の更新, 作成
    /**
     * POST /v1/stocks
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
    app.post('/stocks', async (req: express.Request, res: express.Response) => {
        const stock = req.body;
        const db = await connection();
        const result = await db.get('SELECT amount FROM stock WHERE name = ?', [stock.name]);
        // もし在庫があれば更新
        if (result) {
            await db.run('UPDATE stock SET amount = amount + ? WHERE name = ?', [stock.amount, stock.name]);
        } else {
            await db.run('INSERT INTO stock (name, amount) VALUES (?, ?)', [stock.name, stock.amount]);
        }
        res.setHeader('Location', `/v1/stock/${stock.name}`);
        res.status(201).json(stock);
    });
    // 在庫チェック
    /**
     * GET /v1/stocks(/:name)
     * http response body
     * :nameが指定されている場合
     * {[name]: [amount]} (在庫がない場合はamountは0)
     * :nameが指定されていない場合
     * 全ての商品の在庫の数を:nameで昇順sortして
     * {[name]: [amount], [name]: [amount], ...}で返す
     * 在庫が0のものは含まない
    **/
    app.get('/stocks/:name?', async (req: express.Request, res: express.Response) => {
        const name = req.params.name;
        const db = await connection();
        let result: Stock[] = [];
        if (name) {
            result = await db.all('SELECT name, amount FROM stock WHERE name = ?', [name]);
        } else {
            result = await db.all('SELECT name, amount FROM stock WHERE amount > 0 ORDER BY name ASC');
        }
        res.json(result);
    }
    );
    // 販売
    /**
     * POST /v1/sales
     * http request body
     * {
     * "name": "string" (required),
     * "amount": 0 (optional), 対象の商品を在庫から販売する数（正の整数）を指定する。省略時は 1 とする。
     * "price": 0 (optional), 対象の商品の価格（0より大きい数値）を指定する。入力された時のみ、price x amount を売り上げに加算する。
     * }
     * 
     * http response header
     * Location: /v1/sales/:name
     * 
     * http response body
     * request bodyと同じ
     **/
    app.post('/sales', async (req: express.Request, res: express.Response) => {
        const sales = req.body;
        const db = await connection();
        const result = await db.get('SELECT amount FROM stock WHERE name = ?', [sales.name]);
        if (result.amount < sales.amount) {
            res.status(400).json({ error: '在庫が足りません' });
        } else {
            await db.run('UPDATE stock SET amount = amount - ? WHERE name = ?', [sales.amount, sales.name]);
            if (sales.price) {
                await db.run('UPDATE stock SET sales = sales + ? WHERE name = ?', [sales.price * sales.amount, sales.name]);
            }
            res.setHeader('Location', `/v1/sales/${sales.name}`);
            res.status(201).json(sales);
        }
    }
    );

    // 売り上げチェック
    /**
     * GET /v1/sales
     * 
     * http response body
     * {
     * "sales": 0 (売り上げの合計額, 小数第二位まで)
     * }
     * 
     **/
    app.get('/sales', async (req: express.Request, res: express.Response) => {
        const db = await connection();
        const result = await db.get('SELECT SUM(sales) AS sales FROM stock');
        res.json(result);
    }
    );

    // 全削除
    /**
     * DELETE /v1/stocks
    **/
    app.delete('/stocks', async (req: express.Request, res: express.Response) => {
        const db = await connection();
        await db.run('DELETE FROM stock');
        res.status(204).end();
    }
    );
});