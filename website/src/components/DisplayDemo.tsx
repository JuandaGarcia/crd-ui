import { useState } from 'react';
import { Card } from 'crd-ui/react';

// A saved-card view like a banking dashboard: the card shows only the last4
// and masked meta until the user reveals it. In a real app the reveal handler
// fetches the sensitive values on demand — crd-ui only presents them.
const DETAILS = { number: '5355 2400 0000 5460', expiry: '08/27', cvc: '123' };

export function DisplayDemo() {
  const [revealed, setRevealed] = useState(false);

  return (
    <div className="display-demo">
      <Card
        layout="display"
        variant="graphite"
        brand="mastercard"
        last4="5460"
        name="ADA LOVELACE"
        tilt
        {...(revealed ? DETAILS : {})}
      />
      <button className="btn btn-secondary" type="button" onClick={() => setRevealed((r) => !r)}>
        {revealed ? 'Hide details' : 'Reveal details'}
      </button>
    </div>
  );
}
