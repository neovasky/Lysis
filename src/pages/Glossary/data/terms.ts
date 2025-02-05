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
];

export const terms = sortTerms(rawTerms);
