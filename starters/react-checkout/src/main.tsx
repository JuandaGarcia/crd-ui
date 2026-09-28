import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import 'crd-ui/styles.css';
import './styles.css';
import { Checkout } from './Checkout';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <main className="page">
      <header className="page__header">
        <h1>Checkout</h1>
        <p>
          A payment form with a live card preview, built with{' '}
          <a href="https://crd-ui.juanda.co" target="_blank" rel="noreferrer">
            crd-ui
          </a>
          . Try <code>4242 4242 4242 4242</code> or <code>3782 822463 10005</code>.
        </p>
      </header>
      <Checkout />
    </main>
  </StrictMode>,
);
