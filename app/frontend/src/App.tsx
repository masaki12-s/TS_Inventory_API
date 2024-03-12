import axios from 'axios'
import { useState, useEffect } from 'react'

import './App.css'

function App() {
  const [stocks, setStocks] = useState([Object]);
  useEffect(() => {
    axios
      .get('/api/stocks')
      .then((res) => {
        setStocks(res.data)
        console.log(res.data)
      }).catch((err) => {
        console.log(err)
      })
  }, []);
  const addStock = async (name: string, amount: number) => {
    // * http resuest body
    //  * {
    // * "name": "string" (required),
    // * "amount": 0 (optional),
    // * }
    await axios
      .post('/api/stocks', {
        name: name,
        amount: amount
      })
      .then((res) => {
        console.log(res)
      }).catch((err) => {
        console.log(err)
      })
  }
  // inventoryを表示する
  return (
    <>
      <h2>Inventory App</h2>
      <div class="container">
        <div class="column">
        <p>在庫一覧</p>
        a
          <ul>
            {Object.keys(stocks).map((key: any) => {
              return (
                <li key={key}>
                  {key}: {stocks[key]}
                </li>
              )
            })}
          </ul>
        </div>
        <div class="column">
          <p>在庫追加</p>
          <form action="">
            <label for="name">商品名</label>
            <input type="text" id="name" name="name" />
            <label for="amount">個数</label>
            <input type="number" id="amount" name="amount" />
            <button onClick={() => addStock('apple', 10)}>追加</button>
          </form>
        </div>
      </div>
    </>
  )
}

export default App
