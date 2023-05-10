import { Ladder } from './Ladder'
import { useOrderBookContext } from './useOrderBook'

export const App = () => {
  const { orderBook } = useOrderBookContext()

  return (
    <div style={{ display: 'flex', flexDirection: 'row' }}>
      {Object.keys(orderBook).map((productId) => (
        <Ladder key={productId} productId={productId} productData={orderBook[productId]} />
      ))}
    </div>
  )
}

