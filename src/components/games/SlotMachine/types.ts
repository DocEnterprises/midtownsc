export interface Symbol {
  id: string;
  name: string;
  image: string;
}

export interface Prize {
  id: string;
  symbols: Symbol[];
  reward: string;
  odds: number;
}

export interface SpinResult {
  symbols: Symbol[];
  prize: Prize | null;
}

export interface GameState {
  isSpinning: boolean;
  lastResult: SpinResult | null;
  credits: number;
  wins: Prize[];
}