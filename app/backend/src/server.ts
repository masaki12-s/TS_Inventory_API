import express from 'express';
import dotenv from 'dotenv';
import mysql from "mysql2";
import cors from 'cors';

dotenv.config();

const _port = process.env.PORT || "3000";
const port = parseInt(_port, 10);

// db接続
const connection = mysql.createConnection({
    host: 'db',
    user: process.env.DB_USER,
    port: parseInt(process.env.DB_PORT||"3306", 10),
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
});

// db接続確認
connection.connect((error) => {
    if (error) {
        console.log('DB接続失敗', error);
    } else {
        console.log('DB接続成功');
        main();
    }
});

// テーブル
function initializeTable(conn: mysql.Connection) {
    // drop
    conn.query('DROP TABLE IF EXISTS stock;');
    // create
    conn.query('CREATE TABLE IF NOT EXISTS stock (name VARCHAR(255), amount INT, sales DOUBLE);', (error: any, result: any) => {
        if (error) {
            console.log(error);
        }
    });
}

function addTestData(conn: mysql.Connection) {
    conn.query('INSERT INTO stock (name, amount, sales) VALUES ("apple", 10, 100);');
    conn.query('INSERT INTO stock (name, amount, sales) VALUES ("banana", 20, 200);');
    conn.query('INSERT INTO stock (name, amount, sales) VALUES ("orange", 1, 0);');
}

type Stock = {
    name: string;
    amount: number;
    price: number;
};


function main() {
    initializeTable(connection);
    addTestData(connection);
    const app: express.Express = express();
    app.use(cors({ origin: 'http://frontend:5173'}));
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));
    app.listen(port, () => {
        console.log(`Example app listening at http://localhost:${port}`);
    });
    const error_message = { "message": "ERROR" };

    app.get('/', (req: express.Request, res: express.Response) => {
        res.json({ message: 'Hello World!' });
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
        // クエリの実行
        connection.query('SELECT amount FROM stock WHERE name = ?', [stocks.name], (error: any, result: any) => {
            console.log(error, result);
            if (error) {
                return res.status(500).json(error_message);
            } else {
                if (result) {
                    connection.query('UPDATE stock SET amount = amount + ? WHERE name = ?', [stocks.amount, stocks.name], (error, result) => {
                        if (error) {
                            return res.status(500).json(error_message);
                        }
                    });
                } else {
                    connection.query('INSERT INTO stock (name, amount, sales) VALUES (?, ?, ?)', [stocks.name, stocks.amount, 0], (error, result) => {
                        if (error) {
                            return res.status(500).json(error_message);
                        }
                    });
                }
                return res.status(201).json(stocks);
            }
        });
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
    app.get('/stocks/:name?', (req: express.Request, res: express.Response) => {
        // リクエストパラメータの取得・バリデーション
        const name = req.params.name;
        // nameのバリデーション
        if (name && typeof name !== 'string') {
            return res.status(400).json(error_message);
        }
        let result: Stock[] = [];
        if (name) {
            connection.query('SELECT name, amount FROM stock WHERE name = ?', [name], (error: any, result: any) => {
                if (result.length === 0) {
                    return res.json({ [name]: 0 });
                }
                return res.json({ [result[0].name]: result[0].amount });
            });
        } else {
            connection.query('SELECT name, amount FROM stock WHERE amount > 0 ORDER BY name ASC', (error: any, result: any) => {
                // 形式を変換
                // 例: {"apple": 1, "banana": 2, "orange": 0}
                if (error) {
                    console.log(error);
                    return res.status(500).json(error_message);
                } else {
                    if (result) {
                        const tmp: { [key: string]: number } = {};
                        result.forEach((stock: Stock) => {
                            tmp[stock.name] = stock.amount;
                        });
                        return res.json(tmp);
                    } else {
                        return res.status(404).json(error_message);
                    
                    }
                }
            });
        }
    });

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
    // app.post('/sales', async (req: express.Request, res: express.Response) => {
    //     // リクエストボディの取得・バリデーション
    //     const sales = req.body;
    //     res.setHeader('Location', `/v1/sales/${sales.name}`);
    //     if (!sales.name) {
    //         return res.status(400).json(error_message);
    //     }
    //     // int型かつ正の整数であるかのチェック
    //     if (sales.amount && (!Number.isInteger(sales.amount) || sales.amount < 0)) {
    //         return res.status(400).json(error_message);
    //     }
    //     // int型かつ正の整数であるかのチェック
    //     if (sales.price && (!Number.isInteger(sales.price) || sales.price < 0)) {
    //         return res.status(400).json(error_message);
    //     }
    //     // amountの初期化
    //     let amount = 1;
    //     // もしamountが指定されていればamountを更新
    //     if (sales.amount) {
    //         amount = sales.amount;
    //     }
    //     const db = await connection();
    //     const result = await db.get('SELECT amount FROM stock WHERE name = ?', [sales.name]);
    //     if (!result || result.amount < amount) {
    //         return res.status(400).json(error_message);
    //     } else {
    //         await db.run('UPDATE stock SET amount = amount - ? WHERE name = ?', [amount, sales.name]);
    //         if (sales.price) {
    //             await db.run('UPDATE stock SET sales = sales + ? WHERE name = ?', [sales.price * amount, sales.name]);
    //         }
    //         return res.status(201).json(sales);
    //     }
    // }
    // );

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
    // app.get('/sales', async (req: express.Request, res: express.Response) => {
    //     // リクエストパラメータの取得・バリデーション
    //     // もしパラメータがあればエラー
    //     if (Object.keys(req.query).length !== 0) {
    //         return res.status(400).json(error_message);
    //     }
    //     const db = await connection();
    //     const sales = await db.get('SELECT SUM(sales) AS sales FROM stock');
    //     // 小数であれば小数第二位まで、整数であれば小数第一位まで
    //     const result = { sales: sales.sales.toFixed(sales.sales % 1 === 0 ? 1 : 2) };
    //     return res.json(result);
    // }
    // );

    // 全削除
    /**
     * DELETE /v1/stocks
    **/
    // app.delete('/stocks', async (req: express.Request, res: express.Response) => {
    //     // リクエストパラメータの取得・バリデーション
    //     // もしパラメータがあればエラー
    //     if (Object.keys(req.query).length !== 0) {
    //         return res.status(400).json(error_message);
    //     }
    //     const db = await connection();
    //     await db.run('DELETE FROM stock');
    //     return res.status(204).end();
    // }
    // );
}

