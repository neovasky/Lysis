/**
 * File: src/pages/Glossary/data/terms.ts
 * Description: Glossary terms data
 */

import { GlossaryTerm } from "../types";

// Add a console log to verify the file is being loaded
console.log("Terms file loaded!");

export const terms: GlossaryTerm[] = [
  {
    id: "1",
    term: "P/E Ratio",
    shortDefinition: "Price-to-Earnings Ratio",
    fullDefinition:
      "A valuation metric that compares a company's stock price to its earnings per share.",
    linkedTerms: [{ term: "EPS", definition: "Earnings Per Share" }],
    formula: "P/E = Stock Price / Earnings Per Share",
    formulaExplanation:
      "Measures how much investors are willing to pay for each dollar of a company's earnings.",
    relatedTerms: ["EPS", "Market Value", "Stock Price", "Forward P/E"],
    categories: ["ratios", "fundamentals"],
  },
  {
    id: "2",
    term: "EPS",
    shortDefinition: "Earnings Per Share",
    fullDefinition:
      "A company's profit divided by the outstanding shares of its common stock.",
    linkedTerms: [
      {
        term: "net income",
        definition: "Total earnings after all expenses and taxes",
      },
      {
        term: "outstanding shares",
        definition: "Total number of shares currently held by all shareholders",
      },
    ],
    formula: "EPS = (Net Income - Preferred Dividends) / Outstanding Shares",
    formulaExplanation:
      "Shows how much money a company makes for each share of its stock.",
    relatedTerms: ["P/E Ratio", "Net Income", "Diluted EPS"],
    categories: ["fundamentals", "accounting"],
  },
  {
    id: "3",
    term: "Economic Moat",
    shortDefinition: "A company's sustainable competitive advantage",
    fullDefinition:
      "A business's ability to maintain competitive advantages over its competitors to protect its market position and profitability.",
    linkedTerms: [
      {
        term: "competitive advantage",
        definition:
          "A condition that puts a company in a favorable business position",
      },
    ],
    relatedTerms: ["Market Share", "Brand Value", "Network Effect"],
    categories: ["market", "fundamentals"],
  },
  {
    id: "4",
    term: "Intrinsic Value",
    shortDefinition: "The true or fundamental value of an asset",
    fullDefinition:
      "The actual worth of a company or asset based on its underlying fundamentals, which may differ from its current market price.",
    linkedTerms: [
      {
        term: "margin of safety",
        definition: "The difference between intrinsic value and market price",
      },
      {
        term: "fundamental analysis",
        definition:
          "Evaluating a security's intrinsic value by examining related economic and financial factors",
      },
    ],
    relatedTerms: ["Book Value", "Market Value", "Margin of Safety"],
    categories: ["fundamentals", "market"],
  },
  {
    id: "5",
    term: "EBITDA",
    shortDefinition:
      "Earnings Before Interest, Taxes, Depreciation, and Amortization",
    fullDefinition:
      "A measure of a company's overall financial performance, used as an alternative to net income in some circumstances.",
    linkedTerms: [
      {
        term: "depreciation",
        definition: "Allocation of asset costs over time",
      },
      {
        term: "amortization",
        definition: "Spreading payments over multiple periods",
      },
    ],
    formula:
      "EBITDA = Net Income + Interest + Taxes + Depreciation + Amortization",
    formulaExplanation:
      "Provides a view of operational performance without considering financial and accounting decisions.",
    relatedTerms: ["Operating Income", "Net Income", "EV/EBITDA"],
    categories: ["accounting", "fundamentals"],
  },
  {
    id: "6",
    term: "P/B Ratio",
    shortDefinition: "Price-to-Book Ratio",
    fullDefinition:
      "A ratio comparing a company's market value to its book value, helping identify potentially undervalued or overvalued stocks.",
    linkedTerms: [
      {
        term: "book value",
        definition:
          "The net asset value of a company according to its balance sheet",
      },
      {
        term: "market value",
        definition: "The total value of a company's shares in the market",
      },
    ],
    formula: "P/B = Market Price per Share / Book Value per Share",
    formulaExplanation:
      "Helps investors identify potential value opportunities when market price is below book value.",
    relatedTerms: ["Book Value", "Market Value", "Value Investing"],
    categories: ["ratios", "fundamentals"],
  },
  {
    id: "7",
    term: "Quick Ratio",
    shortDefinition: "Acid-Test Ratio",
    fullDefinition:
      "A more stringent measure of liquidity than the current ratio, excluding inventory from current assets.",
    linkedTerms: [
      {
        term: "current assets",
        definition: "Assets that can be converted to cash within one year",
      },
      {
        term: "current liabilities",
        definition: "Debts and obligations due within one year",
      },
    ],
    formula: "Quick Ratio = (Current Assets - Inventory) / Current Liabilities",
    formulaExplanation:
      "Measures a company's ability to pay short-term obligations using its most liquid assets.",
    relatedTerms: ["Current Ratio", "Working Capital", "Liquidity"],
    categories: ["ratios", "accounting"],
  },
  {
    id: "8",
    term: "ROE",
    shortDefinition: "Return on Equity",
    fullDefinition:
      "A measure of financial performance calculated by dividing net income by shareholders' equity.",
    linkedTerms: [
      {
        term: "net income",
        definition: "Total earnings after all expenses and taxes",
      },
      {
        term: "shareholders' equity",
        definition: "Company's total assets minus total liabilities",
      },
    ],
    formula: "ROE = Net Income / Shareholders' Equity",
    formulaExplanation:
      "Shows how effectively a company uses shareholders' investments to generate profits.",
    relatedTerms: ["ROIC", "ROA", "Net Income"],
    categories: ["ratios", "fundamentals"],
  },
  {
    id: "9",
    term: "ROIC",
    shortDefinition: "Return on Invested Capital",
    fullDefinition:
      "A profitability ratio that measures how efficiently a company uses all its capital to generate profits.",
    linkedTerms: [
      {
        term: "invested capital",
        definition: "Total equity and debt invested in the business",
      },
      { term: "NOPAT", definition: "Net Operating Profit After Taxes" },
    ],
    formula: "ROIC = NOPAT / Invested Capital",
    formulaExplanation:
      "Shows how well a company is using its capital to generate profits, key metric for value investors.",
    relatedTerms: ["ROE", "ROA", "Operating Income"],
    categories: ["ratios", "fundamentals"],
  },
  {
    id: "10",
    term: "Operating Cash Flow",
    shortDefinition: "Cash generated from core business operations",
    fullDefinition:
      "The amount of cash generated by a company's normal business operations, excluding investing and financing activities.",
    linkedTerms: [
      {
        term: "cash flow",
        definition: "Movement of money in and out of a business",
      },
      {
        term: "operating activities",
        definition: "Core business activities generating revenue",
      },
    ],
    formula:
      "OCF = Net Income + Non-Cash Expenses + Changes in Working Capital",
    formulaExplanation:
      "Measures a company's ability to generate cash from its core business operations.",
    relatedTerms: ["Free Cash Flow", "EBITDA", "Working Capital"],
    categories: ["fundamentals", "accounting"],
  },
  {
    id: "11",
    term: "Enterprise Value",
    shortDefinition: "Total value of a company including debt",
    fullDefinition:
      "A measure of a company's total value, including market cap, debt, and cash position.",
    linkedTerms: [
      {
        term: "market capitalization",
        definition: "Total value of outstanding shares",
      },
      {
        term: "net debt",
        definition: "Total debt minus cash and cash equivalents",
      },
    ],
    formula: "EV = Market Cap + Total Debt - Cash and Cash Equivalents",
    formulaExplanation:
      "Represents the theoretical takeover price of a company.",
    relatedTerms: ["Market Cap", "EV/EBITDA", "Book Value"],
    categories: ["market", "fundamentals"],
  },
  {
    id: "12",
    term: "Dividend Yield",
    shortDefinition: "Annual dividend payments relative to stock price",
    fullDefinition:
      "The ratio of a company's annual dividend payments relative to its stock price, expressed as a percentage.",
    linkedTerms: [
      {
        term: "dividend",
        definition: "Regular payment of profits to shareholders",
      },
      {
        term: "ex-dividend date",
        definition: "Date when new buyers won't receive the next dividend",
      },
    ],
    formula:
      "Dividend Yield = (Annual Dividends per Share / Stock Price) × 100",
    formulaExplanation:
      "Shows how much a company pays out in dividends each year relative to its stock price.",
    relatedTerms: ["Dividend Payout Ratio", "Ex-Dividend Date", "Yield"],
    categories: ["market", "fundamentals"],
  },
];
