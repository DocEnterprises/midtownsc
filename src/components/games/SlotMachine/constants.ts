export const SYMBOLS = [
  {
    id: 'gold-coin',
    name: 'Gold Coin',
    image: '/assets/symbols/gold-coin.svg'
  },
  {
    id: 'silver-coin',
    name: 'Silver Coin',
    image: '/assets/symbols/silver-coin.svg'
  },
  {
    id: 'bronze-coin',
    name: 'Bronze Coin',
    image: '/assets/symbols/bronze-coin.svg'
  },
  {
    id: 'diamond-coin',
    name: 'Diamond Coin',
    image: '/assets/symbols/diamond-coin.svg'
  },
  {
    id: 'platinum-coin',
    name: 'Platinum Coin',
    image: '/assets/symbols/platinum-coin.svg'
  },
  {
    id: 'special-coin',
    name: 'Special Coin',
    image: '/assets/symbols/special-coin.svg'
  }
];

export const PRIZES = [
  {
    id: 'free-ounce',
    symbols: Array(6).fill(SYMBOLS[3]), // All diamond coins
    reward: 'Free Ounce!',
    odds: 0.001 // 0.1%
  },
  {
    id: 'free-joint',
    symbols: Array(6).fill(SYMBOLS[4]), // All platinum coins
    reward: 'Free Joint',
    odds: 0.01 // 1%
  },
  {
    id: 'discount-20',
    symbols: Array(6).fill(SYMBOLS[0]), // All gold coins
    reward: '20% Off Next Order',
    odds: 0.02 // 2%
  },
  {
    id: 'discount-10',
    symbols: Array(6).fill(SYMBOLS[1]), // All silver coins
    reward: '10% Off Next Order',
    odds: 0.05 // 5%
  },
  {
    id: 'discount-5',
    symbols: Array(6).fill(SYMBOLS[2]), // All bronze coins
    reward: '5% Off Next Order',
    odds: 0.1 // 10%
  }
];