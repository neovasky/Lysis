/**
 * File: src/pages/Analysis/mockData.ts
 * Description: Mock data for the Analysis page
 */

// Define stock type
export interface Stock {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  marketCap: number;
  sector: string;
  industry: string;
  pe: number;
  eps: number;
  dividend: number;
  dividendYield: number;
  beta: number;
  volume: number;
}

// Mock stock data
export const mockStockData: Record<string, Stock> = {
  AAPL: {
    symbol: "AAPL",
    name: "Apple Inc.",
    price: 187.43,
    change: 1.23,
    changePercent: 0.67,
    marketCap: 2950000000000,
    sector: "Technology",
    industry: "Consumer Electronics",
    pe: 31.22,
    eps: 6.0,
    dividend: 0.96,
    dividendYield: 0.51,
    beta: 1.28,
    volume: 58234100,
  },
  MSFT: {
    symbol: "MSFT",
    name: "Microsoft Corporation",
    price: 417.23,
    change: 2.54,
    changePercent: 0.61,
    marketCap: 3100000000000,
    sector: "Technology",
    industry: "Software—Infrastructure",
    pe: 35.44,
    eps: 11.77,
    dividend: 3.0,
    dividendYield: 0.72,
    beta: 0.93,
    volume: 22456700,
  },
  AMZN: {
    symbol: "AMZN",
    name: "Amazon.com, Inc.",
    price: 178.12,
    change: -0.88,
    changePercent: -0.49,
    marketCap: 1850000000000,
    sector: "Consumer Cyclical",
    industry: "Internet Retail",
    pe: 60.72,
    eps: 2.93,
    dividend: 0,
    dividendYield: 0,
    beta: 1.22,
    volume: 35678200,
  },
  GOOGL: {
    symbol: "GOOGL",
    name: "Alphabet Inc.",
    price: 165.35,
    change: 0.42,
    changePercent: 0.25,
    marketCap: 2080000000000,
    sector: "Communication Services",
    industry: "Internet Content & Information",
    pe: 25.16,
    eps: 6.57,
    dividend: 0,
    dividendYield: 0,
    beta: 1.05,
    volume: 18456700,
  },
  META: {
    symbol: "META",
    name: "Meta Platforms, Inc.",
    price: 498.19,
    change: -5.23,
    changePercent: -1.04,
    marketCap: 1270000000000,
    sector: "Communication Services",
    industry: "Internet Content & Information",
    pe: 28.54,
    eps: 17.45,
    dividend: 0,
    dividendYield: 0,
    beta: 1.34,
    volume: 14234500,
  },
  TSLA: {
    symbol: "TSLA",
    name: "Tesla, Inc.",
    price: 175.43,
    change: -3.21,
    changePercent: -1.8,
    marketCap: 557000000000,
    sector: "Consumer Cyclical",
    industry: "Auto Manufacturers",
    pe: 50.69,
    eps: 3.46,
    dividend: 0,
    dividendYield: 0,
    beta: 2.01,
    volume: 98765400,
  },
  NVDA: {
    symbol: "NVDA",
    name: "NVIDIA Corporation",
    price: 950.02,
    change: 15.34,
    changePercent: 1.64,
    marketCap: 2340000000000,
    sector: "Technology",
    industry: "Semiconductors",
    pe: 80.24,
    eps: 11.84,
    dividend: 0.16,
    dividendYield: 0.02,
    beta: 1.73,
    volume: 45672300,
  },
  JNJ: {
    symbol: "JNJ",
    name: "Johnson & Johnson",
    price: 152.51,
    change: 0.23,
    changePercent: 0.15,
    marketCap: 367000000000,
    sector: "Healthcare",
    industry: "Drug Manufacturers—General",
    pe: 11.23,
    eps: 13.58,
    dividend: 4.76,
    dividendYield: 3.12,
    beta: 0.53,
    volume: 7865400,
  },
  JPM: {
    symbol: "JPM",
    name: "JPMorgan Chase & Co.",
    price: 198.96,
    change: 2.13,
    changePercent: 1.08,
    marketCap: 573000000000,
    sector: "Financial Services",
    industry: "Banks—Diversified",
    pe: 12.01,
    eps: 16.57,
    dividend: 4.4,
    dividendYield: 2.21,
    beta: 1.12,
    volume: 11234500,
  },
  V: {
    symbol: "V",
    name: "Visa Inc.",
    price: 272.36,
    change: 0.87,
    changePercent: 0.32,
    marketCap: 545000000000,
    sector: "Financial Services",
    industry: "Credit Services",
    pe: 30.44,
    eps: 8.95,
    dividend: 2.08,
    dividendYield: 0.76,
    beta: 0.96,
    volume: 6543200,
  },
};

// Define watchlist interface
export interface Watchlist {
  id: string;
  name: string;
  stocks: string[];
  createdAt: Date;
  updatedAt: Date;
}

// Mock watchlists
export const mockWatchlists: Watchlist[] = [
  {
    id: "watchlist-1",
    name: "Tech Stocks",
    stocks: ["AAPL", "MSFT", "GOOGL", "META", "NVDA"],
    createdAt: new Date("2023-01-15"),
    updatedAt: new Date("2023-06-22"),
  },
  {
    id: "watchlist-2",
    name: "Blue Chips",
    stocks: ["JNJ", "JPM", "V"],
    createdAt: new Date("2023-02-10"),
    updatedAt: new Date("2023-05-18"),
  },
  {
    id: "watchlist-3",
    name: "Growth Stocks",
    stocks: ["TSLA", "AMZN", "NVDA"],
    createdAt: new Date("2023-03-05"),
    updatedAt: new Date("2023-07-12"),
  },
];

// Define alert interface
export interface PriceAlert {
  id: string;
  stockSymbol: string;
  targetPrice: number;
  isAbove: boolean;
  createdAt: Date;
  isActive: boolean;
}

// Mock price alerts
export const mockAlerts: PriceAlert[] = [
  {
    id: "alert-1",
    stockSymbol: "AAPL",
    targetPrice: 200,
    isAbove: true,
    createdAt: new Date("2023-05-10"),
    isActive: true,
  },
  {
    id: "alert-2",
    stockSymbol: "TSLA",
    targetPrice: 150,
    isAbove: false,
    createdAt: new Date("2023-06-15"),
    isActive: true,
  },
  {
    id: "alert-3",
    stockSymbol: "MSFT",
    targetPrice: 430,
    isAbove: true,
    createdAt: new Date("2023-07-22"),
    isActive: false,
  },
  {
    id: "alert-4",
    stockSymbol: "NVDA",
    targetPrice: 900,
    isAbove: false,
    createdAt: new Date("2023-08-01"),
    isActive: true,
  },
];
