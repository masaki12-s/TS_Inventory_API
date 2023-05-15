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
    // drop
    await db.run('DROP TABLE IF EXISTS stock;');
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
    const error_message = { "message": "ERROR" };


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
        // リクエストボディの取得・バリデーション
        const stocks = req.body;
        res.setHeader('Location', `/v1/stock/${stocks.name}`);
        if (!stocks.name) {
            return res.status(400).json(error_message);
        }
        // int型かつ正の整数であるかのチェック
        if (stocks.amount && (!Number.isInteger(stocks.amount) || stocks.amount < 0)) {
            return res.status(400).json(error_message);
        }
        if (!stocks.amount) {
            stocks.amount = 1;
        }
        // DBへの接続
        const db = await connection();
        const result = await db.get('SELECT amount FROM stock WHERE name = ?', [stocks.name]);
        // もし在庫があれば更新
        if (result) {
            await db.run('UPDATE stock SET amount = amount + ? WHERE name = ?', [stocks.amount, stocks.name]);
        } else {
            await db.run('INSERT INTO stock (name, amount, sales) VALUES (?, ?, ?)', [stocks.name, stocks.amount, 0]);
        }
        // レスポンスボディの返却
        return res.status(201).json(stocks);
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
     * 例: {"apple": 1, "banana": 2, "orange": 0}
     * 在庫が0のものは含まない
    **/
    app.get('/stocks/:name?', async (req: express.Request, res: express.Response) => {
        // リクエストパラメータの取得・バリデーション
        const name = req.params.name;
        // nameのバリデーション
        if (name && typeof name !== 'string') {
            return res.status(400).json(error_message);
        }
        const db = await connection();
        let result: Stock[] = [];
        if (name) {
            result = await db.all('SELECT name, amount FROM stock WHERE name = ?', [name]);
            return res.json(result);
        } else {
            result = await db.all('SELECT name, amount FROM stock WHERE amount > 0 ORDER BY name ASC');
            // 形式を変換
            // 例: {"apple": 1, "banana": 2, "orange": 0}
            const tmp: { [key: string]: number } = {};
            result.forEach((stock) => {
                tmp[stock.name] = stock.amount;
            });
            return res.json(tmp);
        }
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
        // リクエストボディの取得・バリデーション
        const sales = req.body;
        res.setHeader('Location', `/v1/sales/${sales.name}`);
        if (!sales.name) {
            return res.status(400).json(error_message);
        }
        // int型かつ正の整数であるかのチェック
        if (sales.amount && (!Number.isInteger(sales.amount) || sales.amount < 0)) {
            return res.status(400).json(error_message);
        }
        // int型かつ正の整数であるかのチェック
        if (sales.price && (!Number.isInteger(sales.price) || sales.price < 0)) {
            return res.status(400).json(error_message);
        }
        // amountの初期化
        let amount = 1;
        // もしamountが指定されていればamountを更新
        if (sales.amount) {
            amount = sales.amount;
        }
        const db = await connection();
        const result = await db.get('SELECT amount FROM stock WHERE name = ?', [sales.name]);
        if (!result || result.amount < amount) {
            return res.status(400).json(error_message);
        } else {
            await db.run('UPDATE stock SET amount = amount - ? WHERE name = ?', [amount, sales.name]);
            if (sales.price) {
                await db.run('UPDATE stock SET sales = sales + ? WHERE name = ?', [sales.price * amount, sales.name]);
            }
            return res.status(201).json(sales);
        }
    }
    );

    // 売り上げチェック
    /**
     * GET /v1/sales
     * 
     * http response body
     * {
     * "sales": 0 (売り上げの合計額, 小数第二位まで, 整数の場合は小数第一位まで)
     * }
     * 
     **/
    app.get('/sales', async (req: express.Request, res: express.Response) => {
        // リクエストパラメータの取得・バリデーション
        // もしパラメータがあればエラー
        if (Object.keys(req.query).length !== 0) {
            return res.status(400).json(error_message);
        }
        const db = await connection();
        const sales = await db.get('SELECT SUM(sales) AS sales FROM stock');
        // 小数であれば小数第二位まで、整数であれば小数第一位まで
        const result = { sales: sales.sales.toFixed(sales.sales % 1 === 0 ? 1 : 2) };
        return res.json(result);
    }
    );

    // 全削除
    /**
     * DELETE /v1/stocks
    **/
    app.delete('/stocks', async (req: express.Request, res: express.Response) => {
        // リクエストパラメータの取得・バリデーション
        // もしパラメータがあればエラー
        if (Object.keys(req.query).length !== 0) {
            return res.status(400).json(error_message);
        }
        const db = await connection();
        await db.run('DELETE FROM stock');
        return res.status(204).end();
    }
    );
});