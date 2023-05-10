import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './App';
import { OrderBookProvider } from './useOrderBook';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
)

root.render(
  <OrderBookProvider>
    <App />
  </OrderBookProvider>
)
