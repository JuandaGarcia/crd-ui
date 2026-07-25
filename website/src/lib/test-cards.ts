// The industry-standard test PANs, shared by the Brands showcase and the
// playground's "Test numbers" chips so the two can never drift. These are
// public, Luhn-valid dummy numbers — no issuer ever assigns them.

export interface TestCard {
  /** Short label for the playground chips. */
  label: string;
  /** Cardholder name printed on the Brands showcase tiles. */
  name: string;
  number: string;
  expiry: string;
}

export const TEST_CARDS: TestCard[] = [
  { label: 'Visa', name: 'Visa', number: '4111 1111 1111 1111', expiry: '12/29' },
  { label: 'Mastercard', name: 'Mastercard', number: '5555 5555 5555 4444', expiry: '06/30' },
  { label: 'Amex', name: 'American Express', number: '3782 822463 10005', expiry: '09/28' },
  { label: 'Discover', name: 'Discover', number: '6011 1111 1111 1117', expiry: '03/29' },
  { label: 'Diners', name: 'Diners Club', number: '3056 930902 5904', expiry: '01/28' },
  { label: 'JCB', name: 'JCB', number: '3530 1113 3330 0000', expiry: '10/29' },
  { label: 'UnionPay', name: 'UnionPay', number: '6200 0000 0000 0005', expiry: '05/30' },
  { label: 'Maestro', name: 'Maestro', number: '6759 6498 2643 8453', expiry: '08/28' },
  { label: 'Elo', name: 'Elo', number: '5066 9911 1111 1118', expiry: '02/30' },
  { label: 'Hipercard', name: 'Hipercard', number: '6062 8256 2425 4001', expiry: '07/29' },
];
