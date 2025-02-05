/**
 * File: src/pages/Glossary/data/terms.ts
 * Description: Comprehensive glossary terms data
 */

import { GlossaryTerm } from "../types";

// Sorting function for terms
const sortTerms = (terms: GlossaryTerm[]): GlossaryTerm[] => {
  return [...terms].sort((a, b) => {
    // Remove parentheses and special characters for sorting
    const cleanA = a.term.replace(/[()]/g, "").trim();
    const cleanB = b.term.replace(/[()]/g, "").trim();

    // First, check if both terms start with numbers
    const aNum = cleanA.match(/^\d+/);
    const bNum = cleanB.match(/^\d+/);

    if (aNum && bNum) {
      // If both start with numbers, compare numerically
      return parseInt(aNum[0]) - parseInt(bNum[0]);
    } else if (aNum) {
      // Numbers come before letters
      return -1;
    } else if (bNum) {
      return 1;
    }

    // Otherwise, sort alphabetically (case-insensitive)
    return cleanA.toLowerCase().localeCompare(cleanB.toLowerCase());
  });
};

const rawTerms: GlossaryTerm[] = [
  // Fundamental Valuation Metrics
  {
    id: "1",
    term: "Intrinsic Value",
    shortDefinition: "The true or fundamental value of an asset",
    fullDefinition:
      "The actual worth of an investment based on evaluating all aspects of the business, including both tangible and intangible factors.",
    linkedTerms: [
      {
        term: "fundamental analysis",
        definition:
          "Evaluating a security by examining economic and financial factors",
      },
      {
        term: "margin of safety",
        definition: "Difference between intrinsic value and market price",
      },
    ],
    relatedTerms: ["Margin of Safety", "Book Value", "DCF Analysis"],
    categories: ["fundamentals", "market"],
  },
  {
    id: "2",
    term: "Margin of Safety",
    shortDefinition: "Buffer between price and estimated value",
    fullDefinition:
      "The difference between a stock's intrinsic value and its market price, providing a cushion against errors in calculation or unforeseen circumstances.",
    linkedTerms: [
      {
        term: "intrinsic value",
        definition: "The true or fundamental value of an asset",
      },
      {
        term: "value investing",
        definition: "Investment strategy focusing on undervalued assets",
      },
    ],
    formula: "Margin of Safety = Intrinsic Value - Market Price",
    formulaExplanation:
      "Larger margin of safety provides greater protection against investment losses.",
    relatedTerms: ["Intrinsic Value", "Value Investing", "Risk Management"],
    categories: ["fundamentals", "market"],
  },
  {
    id: "3",
    term: "P/B Ratio",
    shortDefinition: "Price-to-Book Ratio",
    fullDefinition:
      "A ratio comparing market price per share to book value per share, used to identify potentially undervalued or overvalued stocks.",
    linkedTerms: [
      {
        term: "book value",
        definition: "Net value of a company's assets on its balance sheet",
      },
      {
        term: "market price",
        definition: "Current trading price of the stock",
      },
    ],
    formula: "P/B = Market Price per Share / Book Value per Share",
    formulaExplanation:
      "Lower P/B ratios might indicate undervaluation, while higher ratios suggest premium pricing.",
    relatedTerms: ["Book Value", "Market Value", "Tangible Book Value"],
    categories: ["ratios", "fundamentals"],
  },
  {
    id: "4",
    term: "P/S Ratio",
    shortDefinition: "Price-to-Sales Ratio",
    fullDefinition:
      "A valuation metric comparing a company's stock price to its revenue per share.",
    linkedTerms: [
      {
        term: "revenue",
        definition: "Total income from sales before any deductions",
      },
      {
        term: "market capitalization",
        definition: "Total market value of outstanding shares",
      },
    ],
    formula: "P/S = Market Capitalization / Annual Revenue",
    formulaExplanation:
      "Useful for evaluating companies with no earnings, particularly growth companies or startups.",
    relatedTerms: ["Revenue", "Market Cap", "Valuation Metrics"],
    categories: ["ratios", "fundamentals"],
  },
  {
    id: "5",
    term: "EV/EBITDA",
    shortDefinition: "Enterprise Value to EBITDA Ratio",
    fullDefinition:
      "A valuation ratio comparing a company's total value (including debt) to its earnings before interest, taxes, depreciation, and amortization.",
    linkedTerms: [
      {
        term: "enterprise value",
        definition: "Total company value including debt and excluding cash",
      },
      {
        term: "EBITDA",
        definition:
          "Earnings before interest, taxes, depreciation, and amortization",
      },
    ],
    formula: "EV/EBITDA = Enterprise Value / EBITDA",
    formulaExplanation:
      "Popular metric for comparing companies with different capital structures or tax situations.",
    relatedTerms: ["Enterprise Value", "EBITDA", "Capital Structure"],
    categories: ["ratios", "fundamentals"],
  },
  {
    id: "6",
    term: "Dividend Yield",
    shortDefinition: "Annual dividend payments relative to stock price",
    fullDefinition:
      "The ratio of a company's annual dividend payments to its stock price, expressed as a percentage.",
    linkedTerms: [
      {
        term: "dividend",
        definition: "Regular payment of profits to shareholders",
      },
      {
        term: "yield",
        definition: "Return on investment expressed as a percentage",
      },
    ],
    formula:
      "Dividend Yield = (Annual Dividends per Share / Stock Price) × 100",
    formulaExplanation:
      "Higher yields may indicate better income potential but could also suggest unsustainable dividends.",
    relatedTerms: [
      "Dividend Payout Ratio",
      "Ex-Dividend Date",
      "Dividend Growth",
    ],
    categories: ["market", "fundamentals"],
  },
  {
    id: "7",
    term: "Earnings Yield",
    shortDefinition: "Inverse of P/E ratio",
    fullDefinition:
      "The ratio of earnings per share to stock price, showing earnings as a percentage of stock price.",
    linkedTerms: [
      { term: "P/E ratio", definition: "Price-to-earnings ratio" },
      { term: "EPS", definition: "Earnings per share" },
    ],
    formula: "Earnings Yield = (Earnings per Share / Stock Price) × 100",
    formulaExplanation:
      "Used to compare stocks to bonds and evaluate relative valuations.",
    relatedTerms: ["P/E Ratio", "Bond Yields", "Value Investing"],
    categories: ["ratios", "market"],
  },
  {
    id: "8",
    term: "Economic Moat",
    shortDefinition: "Sustainable competitive advantage",
    fullDefinition:
      "A company's ability to maintain competitive advantages over competitors to protect long-term profits and market share.",
    linkedTerms: [
      {
        term: "competitive advantage",
        definition: "Factors that give a company an edge over competitors",
      },
      {
        term: "market share",
        definition: "Percentage of total market sales captured by a company",
      },
    ],
    relatedTerms: ["Brand Value", "Network Effect", "Switching Costs"],
    categories: ["fundamentals", "market"],
  },
  {
    id: "9",
    term: "Balance Sheet",
    shortDefinition: "Statement of financial position",
    fullDefinition:
      "A financial statement that provides a snapshot of a company's assets, liabilities, and shareholders' equity at a specific point in time.",
    linkedTerms: [
      {
        term: "assets",
        definition: "Resources owned by the company with economic value",
      },
      { term: "liabilities", definition: "Company's debts and obligations" },
      {
        term: "shareholders' equity",
        definition: "Net worth of the company to its shareholders",
      },
    ],
    formula: "Assets = Liabilities + Shareholders' Equity",
    formulaExplanation:
      "The fundamental accounting equation showing a company's sources and uses of funds.",
    relatedTerms: [
      "Income Statement",
      "Cash Flow Statement",
      "Working Capital",
    ],
    categories: ["accounting", "fundamentals"],
  },
  {
    id: "10",
    term: "Income Statement",
    shortDefinition: "Profit and loss statement",
    fullDefinition:
      "Financial statement showing revenues, expenses, and profits over a specific period.",
    linkedTerms: [
      { term: "revenue", definition: "Income from sales before deductions" },
      { term: "expenses", definition: "Costs incurred in generating revenue" },
      {
        term: "net income",
        definition: "Bottom-line profit after all deductions",
      },
    ],
    relatedTerms: ["Revenue", "Operating Income", "Net Profit"],
    categories: ["accounting", "fundamentals"],
  },
  {
    id: "11",
    term: "Cash Flow Statement",
    shortDefinition: "Statement of cash movements",
    fullDefinition:
      "Financial statement showing how changes in balance sheet and income accounts affect cash and cash equivalents.",
    linkedTerms: [
      { term: "operating activities", definition: "Core business operations" },
      {
        term: "investing activities",
        definition: "Long-term asset transactions",
      },
      {
        term: "financing activities",
        definition: "External funding and repayment activities",
      },
    ],
    relatedTerms: ["Operating Cash Flow", "Free Cash Flow", "Working Capital"],
    categories: ["accounting", "fundamentals"],
  },
  {
    id: "12",
    term: "Net Profit Margin",
    shortDefinition: "Profitability ratio",
    fullDefinition:
      "Percentage of revenue remaining after all expenses, taxes, interest, and preferred stock dividends.",
    linkedTerms: [
      {
        term: "net income",
        definition: "Bottom-line profit after all deductions",
      },
      { term: "revenue", definition: "Total income from sales" },
    ],
    formula: "Net Profit Margin = (Net Income / Revenue) × 100",
    formulaExplanation:
      "Higher margins indicate better profitability and pricing power.",
    relatedTerms: ["Gross Margin", "Operating Margin", "Profit"],
    categories: ["ratios", "fundamentals"],
  },
  {
    id: "13",
    term: "Beta",
    shortDefinition: "Market sensitivity measure",
    fullDefinition:
      "Measure of a stock's volatility compared to the overall market.",
    linkedTerms: [
      {
        term: "volatility",
        definition: "Degree of variation in a trading price",
      },
      {
        term: "market risk",
        definition: "Risk of losses due to market factors",
      },
    ],
    formula:
      "Beta = Covariance(Stock Return, Market Return) / Variance(Market Return)",
    formulaExplanation:
      "Beta of 1.0 means stock moves with market, >1.0 more volatile, <1.0 less volatile.",
    relatedTerms: ["Volatility", "Market Risk", "Alpha"],
    categories: ["market"],
  },
  {
    id: "14",
    term: "Bid-Ask Spread",
    shortDefinition: "Difference between buy and sell prices",
    fullDefinition:
      "The difference between the highest price a buyer is willing to pay and the lowest price a seller is willing to accept.",
    linkedTerms: [
      { term: "bid price", definition: "Highest price buyers will pay" },
      { term: "ask price", definition: "Lowest price sellers will accept" },
    ],
    formula: "Spread = Ask Price - Bid Price",
    formulaExplanation:
      "Wider spreads indicate less liquidity and higher transaction costs.",
    relatedTerms: ["Liquidity", "Market Maker", "Trading Volume"],
    categories: ["market"],
  },
  {
    id: "15",
    term: "Compound Interest",
    shortDefinition: "Interest on interest",
    fullDefinition:
      "The addition of interest to the principal sum, such that future interest is earned on the accumulated interest as well.",
    linkedTerms: [
      { term: "principal", definition: "Original amount invested" },
      { term: "interest rate", definition: "Percentage rate of return" },
    ],
    formula: "A = P(1 + r)^t",
    formulaExplanation:
      "Where A is final amount, P is principal, r is interest rate, and t is time period.",
    relatedTerms: ["Time Value of Money", "Rule of 72", "Growth Rate"],
    categories: ["fundamentals"],
  },
  {
    id: "16",
    term: "GARP",
    shortDefinition: "Growth at a Reasonable Price",
    fullDefinition:
      "Investment strategy that combines growth and value investing principles by seeking companies with sustainable growth at reasonable valuations.",
    linkedTerms: [
      {
        term: "growth investing",
        definition: "Focusing on companies with high growth potential",
      },
      { term: "value investing", definition: "Seeking undervalued companies" },
    ],
    relatedTerms: ["PEG Ratio", "Growth Rate", "Value Investing"],
    categories: ["fundamentals", "market"],
  },
  {
    id: "17",
    term: "GDP Growth Rate",
    shortDefinition: "Economic growth measure",
    fullDefinition:
      "The percentage increase in a country's Gross Domestic Product from one period to another.",
    linkedTerms: [
      {
        term: "GDP",
        definition: "Total value of goods and services produced in an economy",
      },
      {
        term: "economic growth",
        definition: "Increase in an economy's production of goods and services",
      },
    ],
    formula:
      "GDP Growth Rate = ((Current GDP - Previous GDP) / Previous GDP) × 100",
    formulaExplanation:
      "Positive rates indicate economic expansion, negative rates indicate contraction.",
    relatedTerms: ["Economic Indicators", "Recession", "Business Cycle"],
    categories: ["market"],
  },
  {
    id: "18",
    term: "Risk-Reward Ratio",
    shortDefinition: "Potential return versus risk measure",
    fullDefinition:
      "A comparison between the expected return of an investment and the amount of risk undertaken to capture this return.",
    linkedTerms: [
      { term: "risk", definition: "Potential for loss" },
      { term: "reward", definition: "Potential gain or return" },
    ],
    formula: "Risk-Reward Ratio = Potential Profit / Potential Loss",
    formulaExplanation:
      "Higher ratios indicate better risk-adjusted return potential.",
    relatedTerms: ["Risk Management", "Position Sizing", "Stop Loss"],
    categories: ["market", "fundamentals"],
  },

  {
    id: "19",
    term: "Volatility",
    shortDefinition: "Measure of price variation",
    fullDefinition:
      "The degree of variation in a trading price series over time, often measured by the standard deviation of returns.",
    linkedTerms: [
      {
        term: "standard deviation",
        definition: "Statistical measure of variability",
      },
      {
        term: "price movement",
        definition: "Changes in asset price over time",
      },
    ],
    formula:
      "Historical Volatility = Standard Deviation of Returns × √(Trading Days in Year)",
    formulaExplanation:
      "Higher volatility indicates greater price uncertainty and potential risk/reward.",
    relatedTerms: ["Beta", "VIX", "Risk Management"],
    categories: ["market"],
  },
  {
    id: "20",
    term: "Short Interest",
    shortDefinition: "Shares sold short as percentage of float",
    fullDefinition:
      "The total number of shares sold short divided by the total number of shares available for trading.",
    linkedTerms: [
      {
        term: "short selling",
        definition: "Selling borrowed shares hoping to buy back at lower price",
      },
      {
        term: "float",
        definition: "Number of shares available for public trading",
      },
    ],
    formula:
      "Short Interest Ratio = Shares Sold Short / Average Daily Trading Volume",
    formulaExplanation:
      "High short interest might indicate negative sentiment but potential for short squeeze.",
    relatedTerms: ["Short Squeeze", "Days to Cover", "Short Selling"],
    categories: ["market"],
  },
  {
    id: "21",
    term: "Share Dilution",
    shortDefinition: "Reduction in ownership percentage",
    fullDefinition:
      "Decrease in existing shareholders' ownership percentage due to the issuance of new shares.",
    linkedTerms: [
      {
        term: "outstanding shares",
        definition: "Total number of shares issued and held by investors",
      },
      { term: "stock issuance", definition: "Creation and sale of new shares" },
    ],
    formula:
      "Dilution % = (New Shares Issued / Original Shares Outstanding) × 100",
    formulaExplanation:
      "Shows the percentage reduction in existing shareholders' ownership stake.",
    relatedTerms: ["Stock Offering", "EPS", "Share Buyback"],
    categories: ["market", "fundamentals"],
  },
  {
    id: "22",
    term: "Stock Split",
    shortDefinition: "Division of existing shares",
    fullDefinition:
      "Corporate action that increases the number of shares while proportionally decreasing the price per share.",
    linkedTerms: [
      { term: "par value", definition: "Nominal value of a share" },
      {
        term: "market capitalization",
        definition: "Total market value of outstanding shares",
      },
    ],
    formula: "New Shares = Current Shares × Split Ratio",
    formulaExplanation:
      "Total market value remains same, only the number of shares and price per share change.",
    relatedTerms: ["Reverse Split", "Share Price", "Market Cap"],
    categories: ["market", "fundamentals"],
  },
  {
    id: "23",
    term: "Cigar Butt Investing",
    shortDefinition: "Deep value investing strategy",
    fullDefinition:
      "Benjamin Graham's strategy of buying extremely undervalued stocks that may have one last puff of value left.",
    linkedTerms: [
      {
        term: "value investing",
        definition: "Investing in undervalued assets",
      },
      {
        term: "margin of safety",
        definition: "Buffer between price and intrinsic value",
      },
    ],
    relatedTerms: ["Deep Value", "Net-Net Stocks", "Graham Investing"],
    categories: ["market", "fundamentals"],
  },
  {
    id: "24",
    term: "Mean Reversion",
    shortDefinition: "Return to average value",
    fullDefinition:
      "The theory that asset prices and other market indicators tend to fluctuate around a long-term average.",
    linkedTerms: [
      { term: "average", definition: "Central or typical value in a data set" },
      {
        term: "market cycles",
        definition: "Recurring patterns in market behavior",
      },
    ],
    formula: "Mean = (Sum of Values) / (Number of Values)",
    formulaExplanation:
      "Trading strategy based on price movement back toward historical average.",
    relatedTerms: ["Technical Analysis", "Market Cycles", "Price Movement"],
    categories: ["market"],
  },
  {
    id: "25",
    term: "Contrarian Investing",
    shortDefinition: "Opposing market sentiment",
    fullDefinition:
      "Investment strategy that involves buying assets that are out of favor with the market and selling those that are popular.",
    linkedTerms: [
      { term: "market sentiment", definition: "Overall attitude of investors" },
      {
        term: "value trap",
        definition: "Seemingly cheap stock that keeps declining",
      },
    ],
    relatedTerms: ["Market Psychology", "Value Investing", "Market Timing"],
    categories: ["market", "fundamentals"],
  },
  {
    id: "26",
    term: "Dividend Growth Investing",
    shortDefinition: "Focus on growing dividends",
    fullDefinition:
      "Strategy focusing on companies with history of consistently increasing dividend payments.",
    linkedTerms: [
      {
        term: "dividend",
        definition: "Regular payment of profits to shareholders",
      },
      {
        term: "payout ratio",
        definition: "Percentage of earnings paid as dividends",
      },
    ],
    formula:
      "Dividend Growth Rate = (New Dividend - Old Dividend) / Old Dividend × 100",
    formulaExplanation:
      "Shows the rate at which a company increases its dividend payments.",
    relatedTerms: ["Dividend Yield", "Payout Ratio", "Income Investing"],
    categories: ["fundamentals", "market"],
  },
  {
    id: "27",
    term: "Loss Aversion",
    shortDefinition: "Psychological bias toward losses",
    fullDefinition:
      "Behavioral finance concept where investors feel the pain of losses more intensely than equivalent gains.",
    linkedTerms: [
      {
        term: "behavioral bias",
        definition: "Systematic error in investment decision-making",
      },
      {
        term: "risk tolerance",
        definition: "Ability to accept investment risk",
      },
    ],
    relatedTerms: [
      "Behavioral Finance",
      "Risk Management",
      "Investment Psychology",
    ],
    categories: ["market"],
  },
  {
    id: "28",
    term: "Recency Bias",
    shortDefinition: "Overemphasis on recent events",
    fullDefinition:
      "The tendency to give more importance to recent experiences while undervaluing long-term trends or historical data.",
    linkedTerms: [
      {
        term: "cognitive bias",
        definition: "Systematic pattern of deviation from rational judgment",
      },
      {
        term: "market psychology",
        definition: "Collective behavior of market participants",
      },
    ],
    relatedTerms: [
      "Behavioral Finance",
      "Market Psychology",
      "Decision Making",
    ],
    categories: ["market"],
  },
  {
    id: "29",
    term: "Consumer Price Index (CPI)",
    shortDefinition: "Measure of inflation",
    fullDefinition:
      "A measure of average change in prices paid by urban consumers for a market basket of consumer goods and services.",
    linkedTerms: [
      { term: "inflation", definition: "General increase in prices over time" },
      { term: "purchasing power", definition: "Amount of goods money can buy" },
    ],
    formula:
      "CPI = (Cost of Market Basket in Current Year / Cost in Base Year) × 100",
    formulaExplanation:
      "Used to track inflation and adjust for changes in purchasing power.",
    relatedTerms: ["Inflation Rate", "PPI", "Cost of Living"],
    categories: ["market", "fundamentals"],
  },
  {
    id: "30",
    term: "Bond Yield Curve",
    shortDefinition: "Plot of bond yields vs. maturity",
    fullDefinition:
      "A graph showing the relationship between interest rates and the maturity dates for bonds of similar credit quality.",
    linkedTerms: [
      {
        term: "yield",
        definition: "Return on investment expressed as percentage",
      },
      { term: "maturity", definition: "Time until bond repayment" },
    ],
    relatedTerms: ["Interest Rates", "Bond Pricing", "Term Structure"],
    categories: ["market", "fundamentals"],
  },
  {
    id: "31",
    term: "Price Discovery",
    shortDefinition: "Market price determination",
    fullDefinition:
      "The process by which market prices are determined through the interaction of buyers and sellers.",
    linkedTerms: [
      {
        term: "market efficiency",
        definition: "How well prices reflect available information",
      },
      {
        term: "liquidity",
        definition: "Ease of buying or selling without price impact",
      },
    ],
    relatedTerms: ["Market Efficiency", "Supply and Demand", "Trading Volume"],
    categories: ["market"],
  },
  {
    id: "32",
    term: "Margin of Error",
    shortDefinition: "Statistical uncertainty measure",
    fullDefinition:
      "The range within which the true value of a population parameter is estimated to be.",
    linkedTerms: [
      {
        term: "confidence interval",
        definition: "Range of likely values for a parameter",
      },
      {
        term: "statistical significance",
        definition: "Likelihood result isn't due to chance",
      },
    ],
    formula: "Margin of Error = Critical Value × Standard Error",
    formulaExplanation:
      "Used in financial analysis to account for uncertainty in estimates.",
    relatedTerms: ["Statistical Analysis", "Confidence Level", "Data Analysis"],
    categories: ["fundamentals"],
  },

  {
    id: "33",
    term: "Debt-to-EBITDA",
    shortDefinition: "Leverage ratio measuring ability to pay off debt",
    fullDefinition:
      "A measure of a company's ability to pay off its debt using its operational earnings, indicating financial leverage and risk.",
    linkedTerms: [
      {
        term: "EBITDA",
        definition:
          "Earnings before interest, taxes, depreciation, and amortization",
      },
      {
        term: "leverage",
        definition: "Use of borrowed money to increase potential returns",
      },
    ],
    formula: "Debt-to-EBITDA = Total Debt / EBITDA",
    formulaExplanation:
      "Lower ratios indicate better ability to pay off debt using operational earnings.",
    relatedTerms: ["Leverage Ratio", "Financial Risk", "Credit Analysis"],
    categories: ["ratios", "fundamentals"],
  },
  {
    id: "34",
    term: "Operating Leverage",
    shortDefinition: "Impact of fixed costs on operating income",
    fullDefinition:
      "The degree to which a firm uses fixed costs in its operations, affecting how changes in revenue impact operating income.",
    linkedTerms: [
      {
        term: "fixed costs",
        definition: "Costs that remain constant regardless of production level",
      },
      {
        term: "operating income",
        definition: "Profit from core business operations",
      },
    ],
    formula:
      "Degree of Operating Leverage = % Change in Operating Income / % Change in Sales",
    formulaExplanation:
      "Higher operating leverage means greater profit sensitivity to sales changes.",
    relatedTerms: ["Financial Leverage", "Break-even Analysis", "Fixed Costs"],
    categories: ["fundamentals", "accounting"],
  },
  {
    id: "35",
    term: "Free Cash Flow Yield",
    shortDefinition: "Free cash flow relative to market value",
    fullDefinition:
      "A valuation metric comparing free cash flow per share to stock price, indicating cash generation efficiency.",
    linkedTerms: [
      {
        term: "free cash flow",
        definition: "Operating cash flow minus capital expenditures",
      },
      {
        term: "market value",
        definition: "Total value of a company's outstanding shares",
      },
    ],
    formula: "FCF Yield = Free Cash Flow per Share / Stock Price",
    formulaExplanation:
      "Higher yields may indicate better value and cash generation ability.",
    relatedTerms: ["Dividend Yield", "Cash Flow Analysis", "Valuation Metrics"],
    categories: ["ratios", "fundamentals"],
  },
  {
    id: "36",
    term: "Fibonacci Retracement",
    shortDefinition: "Technical analysis tool using Fibonacci ratios",
    fullDefinition:
      "A method in technical analysis that uses horizontal lines to indicate possible support and resistance levels based on Fibonacci ratios.",
    linkedTerms: [
      {
        term: "support level",
        definition: "Price level where downward trend tends to stall",
      },
      {
        term: "resistance level",
        definition: "Price level where upward trend tends to stall",
      },
    ],
    formula: "Key Fibonacci Ratios: 23.6%, 38.2%, 50%, 61.8%, 78.6%",
    formulaExplanation:
      "Used to identify potential reversal points in price trends.",
    relatedTerms: [
      "Technical Analysis",
      "Support and Resistance",
      "Price Patterns",
    ],
    categories: ["market"],
  },
  {
    id: "37",
    term: "Moving Average Convergence Divergence (MACD)",
    shortDefinition: "Trend-following momentum indicator",
    fullDefinition:
      "A technical indicator showing the relationship between two moving averages of an asset's price, used to identify momentum and trend direction.",
    linkedTerms: [
      {
        term: "moving average",
        definition: "Average price over a specific time period",
      },
      { term: "momentum", definition: "Speed or strength of price movement" },
    ],
    formula:
      "MACD = 12-Period EMA - 26-Period EMA\nSignal Line = 9-Period EMA of MACD",
    formulaExplanation:
      "Helps identify trend changes and momentum shifts in price movement.",
    relatedTerms: ["Technical Analysis", "Moving Averages", "Momentum Trading"],
    categories: ["market"],
  },
  {
    id: "38",
    term: "Relative Strength Index (RSI)",
    shortDefinition: "Momentum oscillator measuring price changes",
    fullDefinition:
      "A momentum oscillator that measures the speed and magnitude of recent price changes to evaluate overbought or oversold conditions.",
    linkedTerms: [
      {
        term: "overbought",
        definition:
          "Condition where price has risen potentially too high too quickly",
      },
      {
        term: "oversold",
        definition:
          "Condition where price has fallen potentially too low too quickly",
      },
    ],
    formula: "RSI = 100 - (100 / (1 + RS))\nRS = Average Gain / Average Loss",
    formulaExplanation:
      "Values range from 0 to 100, with 70+ indicating overbought and 30- indicating oversold conditions.",
    relatedTerms: [
      "Technical Analysis",
      "Momentum Indicators",
      "Overbought/Oversold",
    ],
    categories: ["market"],
  },
  {
    id: "39",
    term: "Bollinger Bands",
    shortDefinition: "Volatility channels around moving average",
    fullDefinition:
      "Technical analysis tool showing price channels based on standard deviations from a moving average, indicating volatility and potential price levels.",
    linkedTerms: [
      {
        term: "standard deviation",
        definition: "Statistical measure of market volatility",
      },
      {
        term: "price channel",
        definition: "Upper and lower boundaries of price movement",
      },
    ],
    formula:
      "Middle Band = 20-day SMA\nUpper Band = 20-day SMA + (20-day StdDev × 2)\nLower Band = 20-day SMA - (20-day StdDev × 2)",
    formulaExplanation:
      "Bands expand during high volatility and contract during low volatility.",
    relatedTerms: ["Technical Analysis", "Moving Averages", "Volatility"],
    categories: ["market"],
  },
  {
    id: "40",
    term: "Confirmation Bias",
    shortDefinition: "Tendency to seek confirming information",
    fullDefinition:
      "The tendency to search for, interpret, and recall information in a way that confirms one's preexisting beliefs or hypotheses.",
    linkedTerms: [
      {
        term: "cognitive bias",
        definition: "Systematic error in thinking affecting decision-making",
      },
      {
        term: "market psychology",
        definition: "Study of investor behavior and emotions",
      },
    ],
    relatedTerms: [
      "Behavioral Finance",
      "Investment Psychology",
      "Decision Making",
    ],
    categories: ["market"],
  },

  {
    id: "41",
    term: "Market Value",
    shortDefinition: "Current total worth of a company in the market",
    fullDefinition:
      "The total value of a company's shares in the open market, reflecting what investors are currently willing to pay for the company.",
    linkedTerms: [
      {
        term: "market cap",
        definition: "Total market value of outstanding shares",
      },
      {
        term: "stock price",
        definition: "Current trading price of a single share",
      },
    ],
    formula: "Market Value = Current Stock Price × Total Outstanding Shares",
    formulaExplanation:
      "Represents the current market's valuation of a company based on its stock price.",
    relatedTerms: ["Book Value", "Intrinsic Value", "Enterprise Value"],
    categories: ["market", "fundamentals"],
  },

  {
    id: "42",
    term: "Book Value",
    shortDefinition: "Net asset value of a company",
    fullDefinition:
      "The total value of a company's assets minus its liabilities, representing the company's net worth according to its balance sheet.",
    linkedTerms: [
      {
        term: "assets",
        definition: "Resources owned by a company having economic value",
      },
      { term: "liabilities", definition: "Company's debts and obligations" },
    ],
    formula: "Book Value = Total Assets - Total Liabilities",
    formulaExplanation: "Shows the accounting value of a company's equity.",
    relatedTerms: ["Market Value", "Tangible Book Value", "P/B Ratio"],
    categories: ["accounting", "fundamentals"],
  },

  {
    id: "43",
    term: "Net Income",
    shortDefinition: "Company's total earnings or profit",
    fullDefinition:
      "The total amount of revenue left after deducting all expenses, taxes, and costs, representing a company's bottom line profitability.",
    linkedTerms: [
      { term: "revenue", definition: "Total income from sales and operations" },
      {
        term: "operating expenses",
        definition: "Costs associated with running the business",
      },
    ],
    formula: "Net Income = Total Revenue - Total Expenses",
    formulaExplanation:
      "Shows how much profit a company has generated after accounting for all costs and expenses.",
    relatedTerms: ["Gross Profit", "Operating Income", "EPS"],
    categories: ["accounting", "fundamentals"],
  },

  {
    id: "44",
    term: "Operating Income",
    shortDefinition: "Profit from core business operations",
    fullDefinition:
      "Profit earned from a company's regular business operations before deducting interest and taxes.",
    linkedTerms: [
      { term: "revenue", definition: "Total income from sales and operations" },
      {
        term: "operating expenses",
        definition: "Costs associated with running the business",
      },
    ],
    formula: "Operating Income = Gross Profit - Operating Expenses",
    formulaExplanation:
      "Measures profitability from core business activities excluding financing and tax impacts.",
    relatedTerms: ["EBIT", "Net Income", "Operating Margin"],
    categories: ["accounting", "fundamentals"],
  },
  {
    id: "45",
    term: "Gross Profit",
    shortDefinition: "Revenue minus cost of goods sold",
    fullDefinition:
      "The profit a company makes after deducting the costs associated with producing and selling its products.",
    linkedTerms: [
      { term: "revenue", definition: "Total income from sales" },
      { term: "COGS", definition: "Direct costs of producing goods" },
    ],
    formula: "Gross Profit = Revenue - Cost of Goods Sold",
    formulaExplanation:
      "Shows profitability before accounting for operating expenses and overhead.",
    relatedTerms: ["Gross Margin", "Operating Income", "Revenue"],
    categories: ["accounting", "fundamentals"],
  },

  // Market Analysis Terms
  {
    id: "46",
    term: "Alpha",
    shortDefinition: "Excess return of investment relative to benchmark",
    fullDefinition:
      "The excess return of an investment relative to the return of a benchmark index.",
    linkedTerms: [
      {
        term: "benchmark",
        definition: "Standard against which performance is measured",
      },
      {
        term: "excess return",
        definition: "Return above what was expected based on risk",
      },
    ],
    formula: "Alpha = Actual Return - Expected Return (based on Beta)",
    formulaExplanation:
      "Positive alpha indicates outperformance relative to risk-adjusted expectations.",
    relatedTerms: ["Beta", "Risk-Adjusted Return", "Active Management"],
    categories: ["market"],
  },
  {
    id: "47",
    term: "VIX",
    shortDefinition: "Market's expectation of 30-day volatility",
    fullDefinition:
      "The CBOE Volatility Index, which measures the market's expectation of future volatility based on S&P 500 index options.",
    linkedTerms: [
      {
        term: "volatility",
        definition: "Degree of variation in trading price",
      },
      {
        term: "options",
        definition: "Contracts giving rights to buy or sell assets",
      },
    ],
    formula: "VIX calculation based on S&P 500 options prices",
    formulaExplanation:
      "Higher VIX values indicate greater expected market volatility.",
    relatedTerms: ["Volatility", "Market Risk", "Options"],
    categories: ["market"],
  },

  // Technical Analysis Terms
  {
    id: "48",
    term: "Support Level",
    shortDefinition: "Price level where downward trend tends to stop",
    fullDefinition:
      "A price level where a downward trend tends to weaken due to increased buying pressure.",
    linkedTerms: [
      { term: "price level", definition: "Specific point where stock trades" },
      { term: "buying pressure", definition: "Increased demand for buying" },
    ],
    relatedTerms: ["Resistance Level", "Technical Analysis", "Price Action"],
    categories: ["market"],
  },
  {
    id: "49",
    term: "Resistance Level",
    shortDefinition: "Price level where upward trend tends to stop",
    fullDefinition:
      "A price level where an upward trend tends to weaken due to increased selling pressure.",
    linkedTerms: [
      { term: "price level", definition: "Specific point where stock trades" },
      { term: "selling pressure", definition: "Increased supply for selling" },
    ],
    relatedTerms: ["Support Level", "Technical Analysis", "Price Action"],
    categories: ["market"],
  },

  // Financial Statement Terms
  {
    id: "50",
    term: "Working Capital",
    shortDefinition: "Current assets minus current liabilities",
    fullDefinition:
      "The difference between a company's current assets and current liabilities, representing operational liquidity.",
    linkedTerms: [
      {
        term: "current assets",
        definition: "Assets that can be converted to cash within a year",
      },
      { term: "current liabilities", definition: "Debts due within one year" },
    ],
    formula: "Working Capital = Current Assets - Current Liabilities",
    formulaExplanation:
      "Positive working capital indicates good short-term liquidity and ability to fund operations.",
    relatedTerms: ["Current Ratio", "Quick Ratio", "Liquidity"],
    categories: ["accounting", "fundamentals"],
  },
  {
    id: "51",
    term: "Capital Structure",
    shortDefinition: "Mix of debt and equity financing",
    fullDefinition:
      "The way a company finances its operations and investments using different sources of funds.",
    linkedTerms: [
      {
        term: "debt financing",
        definition: "Borrowing money to fund operations",
      },
      {
        term: "equity financing",
        definition: "Raising funds by selling ownership shares",
      },
    ],
    formula: "Debt-to-Equity Ratio = Total Debt / Total Equity",
    formulaExplanation:
      "Shows the proportion of debt to equity used to finance the company.",
    relatedTerms: ["Debt-to-Equity", "Financial Leverage", "Cost of Capital"],
    categories: ["fundamentals", "accounting"],
  },

  // Investment Terms
  {
    id: "52",
    term: "Risk-Adjusted Return",
    shortDefinition: "Return relative to amount of risk",
    fullDefinition:
      "A measure of investment return that accounts for the risk taken to achieve that return.",
    linkedTerms: [
      { term: "risk", definition: "Potential for loss or underperformance" },
      { term: "return", definition: "Gain or loss on investment" },
    ],
    formula: "Sharpe Ratio = (Return - Risk-Free Rate) / Standard Deviation",
    formulaExplanation:
      "Higher ratios indicate better return per unit of risk.",
    relatedTerms: ["Sharpe Ratio", "Alpha", "Risk Management"],
    categories: ["market", "fundamentals"],
  },
  {
    id: "53",
    term: "Network Effect",
    shortDefinition: "Value increases with number of users",
    fullDefinition:
      "A phenomenon where a product or service becomes more valuable as more people use it.",
    linkedTerms: [
      {
        term: "competitive advantage",
        definition: "Factors giving company edge over competitors",
      },
      {
        term: "market share",
        definition: "Company's sales as percentage of total market",
      },
    ],
    relatedTerms: ["Economic Moat", "Switching Costs", "Brand Value"],
    categories: ["fundamentals", "market"],
  },

  // Cost & Expense Terms
  {
    id: "54",
    term: "Cost of Capital",
    shortDefinition: "Required return for investment funding",
    fullDefinition:
      "The minimum return a company must earn on investments to satisfy its investors and creditors.",
    linkedTerms: [
      { term: "WACC", definition: "Weighted Average Cost of Capital" },
      {
        term: "required return",
        definition: "Minimum return investors demand",
      },
    ],
    formula: "WACC = (E/V × Re) + (D/V × Rd × (1-T))",
    formulaExplanation:
      "Weighted average of cost of equity and after-tax cost of debt.",
    relatedTerms: ["WACC", "Capital Structure", "Required Return"],
    categories: ["fundamentals", "accounting"],
  },
  {
    id: "55",
    term: "Operating Leverage",
    shortDefinition: "Fixed costs impact on operating income",
    fullDefinition:
      "Measure of how revenue growth translates into operating income growth based on fixed cost structure.",
    linkedTerms: [
      {
        term: "fixed costs",
        definition: "Costs that don't vary with production",
      },
      {
        term: "variable costs",
        definition: "Costs that change with production level",
      },
    ],
    formula: "DOL = % Change in Operating Income / % Change in Sales",
    formulaExplanation:
      "Higher operating leverage means greater profit sensitivity to sales changes.",
    relatedTerms: ["Financial Leverage", "Break-even Point", "Fixed Costs"],
    categories: ["fundamentals", "accounting"],
  },

  {
    id: "56",
    term: "Market Maker",
    shortDefinition: "Provider of market liquidity",
    fullDefinition:
      "A firm that provides market liquidity by quoting both buy and sell prices for securities.",
    linkedTerms: [
      {
        term: "liquidity",
        definition:
          "Ease of buying or selling without significant price impact",
      },
      {
        term: "bid-ask spread",
        definition: "Difference between buy and sell prices",
      },
    ],
    relatedTerms: ["Liquidity", "Trading Volume", "Bid-Ask Spread"],
    categories: ["market"],
  },
  {
    id: "57",
    term: "Trading Volume",
    shortDefinition: "Number of shares traded",
    fullDefinition:
      "The total number of shares or contracts traded during a specified period.",
    linkedTerms: [
      { term: "volume", definition: "Number of shares changing hands" },
      { term: "liquidity", definition: "Ease of trading without price impact" },
    ],
    relatedTerms: ["Liquidity", "Market Maker", "Price Action"],
    categories: ["market"],
  },

  // Value Investing Terms
  {
    id: "58",
    term: "Deep Value",
    shortDefinition: "Extremely undervalued assets",
    fullDefinition:
      "Investment strategy focusing on stocks trading significantly below their intrinsic value.",
    linkedTerms: [
      {
        term: "intrinsic value",
        definition: "True or fundamental value of an asset",
      },
      {
        term: "margin of safety",
        definition: "Difference between value and price",
      },
    ],
    relatedTerms: ["Net-Net Stocks", "Cigar Butt Investing", "Value Trap"],
    categories: ["market", "fundamentals"],
  },
  {
    id: "59",
    term: "Net-Net Stocks",
    shortDefinition: "Stocks below net current asset value",
    fullDefinition:
      "Companies trading below their net current asset value (current assets minus all liabilities).",
    linkedTerms: [
      {
        term: "current assets",
        definition: "Assets convertible to cash within one year",
      },
      { term: "NCAV", definition: "Net Current Asset Value" },
    ],
    formula: "NCAV = Current Assets - Total Liabilities",
    formulaExplanation:
      "Graham's method for finding extremely undervalued stocks.",
    relatedTerms: ["Deep Value", "Book Value", "Graham Investing"],
    categories: ["fundamentals", "market"],
  },

  // Financial Metrics
  {
    id: "60",
    term: "Tangible Book Value",
    shortDefinition: "Book value excluding intangible assets",
    fullDefinition:
      "Net asset value excluding intangible assets like goodwill, patents, and trademarks.",
    linkedTerms: [
      {
        term: "intangible assets",
        definition: "Non-physical assets like patents and goodwill",
      },
      {
        term: "book value",
        definition: "Net value of assets on balance sheet",
      },
    ],
    formula:
      "Tangible Book Value = Total Assets - Intangible Assets - Total Liabilities",
    formulaExplanation: "Conservative measure of company's net asset value.",
    relatedTerms: ["Book Value", "P/B Ratio", "Net Asset Value"],
    categories: ["accounting", "fundamentals"],
  },
  {
    id: "61",
    term: "WACC",
    shortDefinition: "Weighted Average Cost of Capital",
    fullDefinition:
      "Average rate a company pays to finance its assets, weighted by the proportion of debt and equity.",
    linkedTerms: [
      {
        term: "cost of equity",
        definition: "Required return for equity investors",
      },
      { term: "cost of debt", definition: "Interest rate on borrowed funds" },
    ],
    formula: "WACC = (E/V × Re) + (D/V × Rd × (1-T))",
    formulaExplanation:
      "Represents minimum return needed on investments to satisfy all capital providers.",
    relatedTerms: ["Cost of Capital", "Capital Structure", "Required Return"],
    categories: ["fundamentals", "accounting"],
  },

  // Risk Management
  {
    id: "62",
    term: "Position Sizing",
    shortDefinition: "Managing investment position amounts",
    fullDefinition:
      "The practice of determining how much to invest in each position to manage risk and optimize returns.",
    linkedTerms: [
      {
        term: "risk management",
        definition: "Practices to control investment risk",
      },
      {
        term: "portfolio allocation",
        definition: "Distribution of investments",
      },
    ],
    relatedTerms: ["Risk Management", "Stop Loss", "Portfolio Diversification"],
    categories: ["market", "fundamentals"],
  },
  {
    id: "63",
    term: "Stop Loss",
    shortDefinition: "Order to limit potential losses",
    fullDefinition:
      "An order to sell a security when it reaches a specified price, designed to limit potential losses.",
    linkedTerms: [
      { term: "order", definition: "Instruction to buy or sell security" },
      {
        term: "risk management",
        definition: "Methods to control potential losses",
      },
    ],
    relatedTerms: ["Risk Management", "Position Sizing", "Trading Strategy"],
    categories: ["market"],
  },

  // Add these to your existing terms array

  // Enterprise Value and Related Terms
  {
    id: "64",
    term: "Enterprise Value",
    shortDefinition: "Total value of a company including debt",
    fullDefinition:
      "A measure of a company's total value, including market cap, debt, preferred stock, and minority interests, minus cash and cash equivalents.",
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
    formula:
      "EV = Market Cap + Total Debt + Preferred Stock + Minority Interest - Cash & Equivalents",
    formulaExplanation:
      "Represents the theoretical takeover price of a company including all obligations.",
    relatedTerms: ["Market Cap", "EV/EBITDA", "Net Debt"],
    categories: ["fundamentals", "market"],
  },
  {
    id: "65",
    term: "Net Debt",
    shortDefinition: "Total debt minus cash position",
    fullDefinition:
      "The total debt of a company minus its cash and cash equivalents, showing true debt burden.",
    linkedTerms: [
      {
        term: "total debt",
        definition: "Sum of all short and long-term debt obligations",
      },
      {
        term: "cash equivalents",
        definition: "Highly liquid short-term investments",
      },
    ],
    formula: "Net Debt = Total Debt - Cash and Cash Equivalents",
    formulaExplanation:
      "Shows actual debt burden after considering available cash resources.",
    relatedTerms: ["Enterprise Value", "Debt-to-Equity", "Financial Leverage"],
    categories: ["fundamentals", "accounting"],
  },

  // Profitability Ratios
  {
    id: "66",
    term: "Gross Margin",
    shortDefinition: "Gross profit as percentage of revenue",
    fullDefinition:
      "The percentage of revenue remaining after accounting for cost of goods sold (COGS).",
    linkedTerms: [
      { term: "gross profit", definition: "Revenue minus cost of goods sold" },
      {
        term: "COGS",
        definition: "Direct costs of producing goods or services",
      },
    ],
    formula: "Gross Margin = (Revenue - COGS) / Revenue × 100",
    formulaExplanation:
      "Higher margins indicate better efficiency in producing goods or services.",
    relatedTerms: ["Operating Margin", "Profit Margin", "COGS"],
    categories: ["ratios", "fundamentals"],
  },
  {
    id: "67",
    term: "Operating Margin",
    shortDefinition: "Operating income as percentage of revenue",
    fullDefinition:
      "The percentage of revenue remaining after all operating expenses are deducted.",
    linkedTerms: [
      {
        term: "operating income",
        definition: "Profit from core business operations",
      },
      {
        term: "operating expenses",
        definition: "Costs associated with running the business",
      },
    ],
    formula: "Operating Margin = Operating Income / Revenue × 100",
    formulaExplanation:
      "Shows operational efficiency before interest and taxes.",
    relatedTerms: ["Gross Margin", "Net Profit Margin", "EBIT Margin"],
    categories: ["ratios", "fundamentals"],
  },

  // Efficiency Ratios
  {
    id: "68",
    term: "Asset Turnover",
    shortDefinition: "Revenue generated per dollar of assets",
    fullDefinition:
      "Measures how efficiently a company uses its assets to generate sales revenue.",
    linkedTerms: [
      {
        term: "total assets",
        definition: "All resources owned by the company",
      },
      {
        term: "revenue",
        definition: "Total income from sales before deductions",
      },
    ],
    formula: "Asset Turnover = Revenue / Average Total Assets",
    formulaExplanation:
      "Higher ratio indicates more efficient use of assets to generate sales.",
    relatedTerms: ["ROA", "Working Capital Turnover", "Efficiency Ratio"],
    categories: ["ratios", "fundamentals"],
  },
  {
    id: "69",
    term: "Inventory Turnover",
    shortDefinition: "How quickly inventory is sold",
    fullDefinition:
      "Measures how many times a company's inventory is sold and replaced over a period.",
    linkedTerms: [
      { term: "COGS", definition: "Cost of Goods Sold" },
      {
        term: "average inventory",
        definition: "Mean inventory level over period",
      },
    ],
    formula: "Inventory Turnover = COGS / Average Inventory",
    formulaExplanation:
      "Higher ratios indicate more efficient inventory management.",
    relatedTerms: [
      "Days Inventory Outstanding",
      "Working Capital",
      "Efficiency",
    ],
    categories: ["ratios", "accounting"],
  },

  // Coverage Ratios
  {
    id: "70",
    term: "Interest Coverage Ratio",
    shortDefinition: "Ability to pay interest on debt",
    fullDefinition:
      "Measures how easily a company can pay interest on its outstanding debt.",
    linkedTerms: [
      { term: "EBIT", definition: "Earnings Before Interest and Taxes" },
      { term: "interest expense", definition: "Cost of borrowing money" },
    ],
    formula: "Interest Coverage Ratio = EBIT / Interest Expense",
    formulaExplanation:
      "Higher ratio indicates better ability to meet interest payments.",
    relatedTerms: ["Debt Service Coverage", "Fixed Charge Coverage", "EBIT"],
    categories: ["ratios", "accounting"],
  },
  {
    id: "71",
    term: "Debt Service Coverage Ratio",
    shortDefinition: "Ability to service total debt",
    fullDefinition:
      "Measures company's ability to pay all debt obligations including principal and interest.",
    linkedTerms: [
      {
        term: "operating income",
        definition: "Profit from core business operations",
      },
      {
        term: "debt service",
        definition: "Total debt payments including principal and interest",
      },
    ],
    formula: "DSCR = Net Operating Income / Total Debt Service",
    formulaExplanation:
      "Ratio above 1 indicates sufficient income to cover debt payments.",
    relatedTerms: ["Interest Coverage", "Fixed Charge Coverage", "Solvency"],
    categories: ["ratios", "accounting"],
  },

  // Valuation Ratios
  {
    id: "72",
    term: "EV/Sales Ratio",
    shortDefinition: "Enterprise value relative to revenue",
    fullDefinition:
      "Compares a company's enterprise value to its annual revenue.",
    linkedTerms: [
      {
        term: "enterprise value",
        definition: "Total company value including debt and excluding cash",
      },
      {
        term: "revenue",
        definition: "Total income from sales before deductions",
      },
    ],
    formula: "EV/Sales = Enterprise Value / Annual Revenue",
    formulaExplanation:
      "Used to value companies with negative earnings or in high-growth phases.",
    relatedTerms: ["EV/EBITDA", "P/S Ratio", "Valuation Multiples"],
    categories: ["ratios", "market"],
  },
  {
    id: "73",
    term: "PEG Ratio",
    shortDefinition: "P/E ratio relative to growth",
    fullDefinition:
      "Compares a company's P/E ratio to its expected earnings growth rate.",
    linkedTerms: [
      { term: "P/E ratio", definition: "Price to earnings ratio" },
      {
        term: "growth rate",
        definition: "Expected annual increase in earnings",
      },
    ],
    formula: "PEG = P/E Ratio / Annual EPS Growth Rate",
    formulaExplanation:
      "PEG < 1 might indicate undervaluation relative to growth prospects.",
    relatedTerms: ["P/E Ratio", "Growth Rate", "GARP"],
    categories: ["ratios", "market"],
  },
];

export const terms = sortTerms(rawTerms);
