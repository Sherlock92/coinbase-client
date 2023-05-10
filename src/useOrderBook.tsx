import { useState, useEffect, useRef, createContext, useContext } from 'react'

// Custom hook for coinbase API connection.
// Connects to the level 2 feed for btc and eth.
// Maintains the order book through the snapshot/updates
// Coalescing/throttling of updates at 100ms

interface MarketData {
  bids: Map<number, number>
  asks: Map<number, number>
}

interface OrderBook {
  [productId: string]: MarketData
}

const useOrderBook = () => {
  const [counter, setCounter] = useState(0)
  const [orderBook, setOrderBook] = useState<OrderBook>({})
  const updatesQueue = useRef<any>([])

  useEffect(() => {
    setInterval(() => { setCounter(prevCounter => prevCounter + 1) }, 100)
  }, [])

  useEffect(() => {
    const ws = new WebSocket(process.env.REACT_APP_COINBASE_API || '')

    ws.onopen = () => {
      ws.send(JSON.stringify({
        type: 'subscribe',
        product_ids: JSON.parse(process.env.REACT_APP_PRODUCTS || ''),
        channels: ['level2'],
      }))
    }

    ws.onmessage = (event) => {
      const message = JSON.parse(event.data)

      if (message.type === 'snapshot') {
        const productId = message.product_id;
        setOrderBook((prevOrderBook: OrderBook) => ({
          ...prevOrderBook,
          [productId]: {
            bids: new Map(message.bids.slice(0, 100).map((bid: any) => [Number(bid[0]), Number(bid[1])])),
            asks: new Map(message.asks.slice(0, 100).reverse().map((ask: any) => [Number(ask[0]), Number(ask[1])])),
          },
        }))
      } else if (message.type === 'l2update') {
        updatesQueue.current.push(message)
      }
    }

    ws.onerror = (error) => {
      console.log(error)
    }

    return () => {
      ws.close();
    };
  }, [])

  useEffect(() => {
    if (updatesQueue.current.length === 0) return

    const updateOrderBook = (message: any) => {
      const productId = message.product_id
      setOrderBook((prevOrderBook: OrderBook) => {
        const updatedOrderBook = { ...prevOrderBook }
        const productOrderBook = updatedOrderBook[productId]

        message.changes.forEach((change: any) => {
          const side = change[0]
          const price = Number(change[1])
          const size = Number(change[2])
          const targetSide = side === 'buy' ? productOrderBook.bids : productOrderBook.asks
          if (size === 0) {
            targetSide.delete(price)
          } else {
            targetSide.set(price, size)
          }
        })

        return updatedOrderBook
      })
    }

    updatesQueue.current.forEach(updateOrderBook)
    updatesQueue.current = []
  }, [counter])

  return { orderBook }
}

// Create context and provider for the order book hook
const OrderBookContext = createContext<any>(null);

const OrderBookProvider = ({ children }: any) => {
  const orderBookHookValue = useOrderBook()
  return (
    <OrderBookContext.Provider value={orderBookHookValue}>
      {children}
    </OrderBookContext.Provider>
  )
}

const useOrderBookContext = () => {
  const context = useContext(OrderBookContext);
  if (context === null) {
    throw new Error('useOrderBookContext must be used within an OrderBookProvider')
  }
  return context
}

export { useOrderBook, OrderBookProvider, useOrderBookContext }
