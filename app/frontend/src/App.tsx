import axios from 'axios'
import { useState, useEffect } from 'react'

import './App.css'

// objectsの例
// Object { apple: 10, banana: 20, orange: 1 }

function App() {
  const [stocks, setStocks] = useState([Object]);
  useEffect(() => {
    axios
      .get('http://localhost:3000/stocks')
      .then((res) => {
        setStocks(res.data)
        console.log(res.data)
      }).catch((err) => {
        console.log(err)
      })
  }, []);
  // inventoryを表示する
  return (
    <>
      <h2>Inventory</h2>
      <ul>
        {Object.keys(stocks).map((key) => {
          return (
            <li key={key}>
              {key}: {stocks[key]}
            </li>
          )
        })}
      </ul>
    </>
  )
}

export default App
