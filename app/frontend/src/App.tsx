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
        <p>在庫一覧</p>
          <ul>
            {Object.keys(stocks).map((key: any) => {
              return (
                <li key={key}>
                  {key}: {stocks[key]}
                </li>
              )
            })}
          </ul>

          <p>在庫追加</p>
          <form action="">
            <label htmlFor="name">商品名</label>
            <input type="text" id="name" name="name" />
            <label htmlFor="amount">数量</label>
            <input type="number" id="amount" name="amount" />
            <button onClick={() => addStock('name', 1)}>追加</button>
          </form>
    </>
  )
}

export default App
