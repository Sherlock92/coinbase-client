import { FC, forwardRef, useEffect, useRef, useState, memo, Ref, ReactElement } from 'react'

export interface LadderRowProps {
  price: number
  bid?: number
  ask?: number
  ref?: Ref<HTMLTableRowElement>
}

const LadderRow: FC<LadderRowProps> = memo(
  forwardRef<HTMLTableRowElement, LadderRowProps>(({ price, bid=0, ask=0 }, ref) => {
    return (
      <tr ref={ref}>
        <td style={{ background: !!bid ? '#FA8072' : '' }}>
          {Math.round(bid * 10000) / 10000 || ''}
        </td>

        <td style={{ background: 'lightgrey' }}>
          {price}
        </td>

        <td style={{ background: !!ask ? '#3498DB' : '' }}>
          {Math.round(ask * 10000) / 10000 || ''}
        </td>
      </tr>
    );
  }),
);


export interface LadderProps {
  productId: string
  productData: any
}

export const Ladder: FC<LadderProps> = ({ productId, productData }) => {
  const [counter, setCounter] = useState(0)
  const [autoCenter, setAutoCenter] = useState(false)
  const firstBidRowRef = useRef(null)
  const containerRef = useRef(null)

  useEffect(() => {
    setInterval(() => {
      setCounter(prevCounter => prevCounter + 1)
    }, 500)
  }, [])

  useEffect(() => {
    if (containerRef.current && firstBidRowRef.current && autoCenter) {
      const container: HTMLElement = containerRef.current;
      const firstBidRow: HTMLTableRowElement = firstBidRowRef.current;
      container.scrollTop = (firstBidRow.offsetTop - container.offsetTop) - (window.innerHeight / 6);
    }
  }, [counter, autoCenter]);

  const generateRows = () => {
    const rows: ReactElement<LadderRowProps>[] = []
    const askPrices = (Array.from(productData.asks.keys()) as number[]).sort((a, b) => b - a)
    const bidPrices = (Array.from(productData.bids.keys()) as number[]).sort((a, b) => b - a)

    for (let i = 0; i < askPrices.length; i++)
      rows.push(
        <LadderRow key={askPrices[i]} price={askPrices[i]} ask={productData.asks.get(askPrices[i])} />
      )

    const bidPrc = bidPrices[0]
    rows.push(
      <LadderRow key={bidPrc} ref={firstBidRowRef} price={bidPrc} bid={productData.bids.get(bidPrc)} />
    )
    for (let i = 1; i < bidPrices.length; i++)
      rows.push(
        <LadderRow key={bidPrices[i]}  price={bidPrices[i]} bid={productData.bids.get(bidPrices[i])} />
      )

    return rows
  }

  return (
    <div>
      <h1>{productId}</h1>
      <input type="checkbox" checked={autoCenter} onChange={(evt) => setAutoCenter(evt.target.checked)}/> {'auto center'}
      <div ref={containerRef} style={{ maxHeight: '80vh', overflowY: 'scroll' }}>
        <table>
          <thead>
            <tr>
              <th>bid vol</th>
              <th>price</th>
              <th>ask vol</th>
            </tr>
          </thead>
          <tbody>
            {generateRows()}
          </tbody>
        </table>
      </div>
    </div>
  )
}