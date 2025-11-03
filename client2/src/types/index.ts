export type Page =
  | 'home'
  | 'about'
  | 'contact'
  | 'hook-developer'
  | 'protocol-designer'
  | 'integrator';

export interface NavigationProps {
  onNavigate: (page: Page) => void;
}

export interface Hook {
  id: string;
  name: string;
  category: string;
  status: 'active' | 'pending' | 'inactive';
  pools: number;
  revenue: string;
  description?: string;
}

export interface Protocol {
  id: string;
  name: string;
  feeRecipient: string;
  pools: number;
  revenue: string;
  status: 'active' | 'pending' | 'inactive';
}

export interface Pool {
  id: string;
  address: string;
  tokenPair: string;
  feeTier: string;
  hook: string;
  tvl: string;
  volume: string;
  revenue: string;
}

export interface Statistic {
  label: string;
  value: number;
  prefix?: string;
  suffix?: string;
}
