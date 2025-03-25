/**
 * File: src/pages/Analysis/DCFAnalysisPage.tsx
 * Description: DCF (Discounted Cash Flow) analysis page for stock valuation with typeable inputs
 */

import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useTheme } from "@/theme/hooks/useTheme";
import {
  ArrowLeft,
  Save,
  Download,
  HelpCircle,
  Info,
  ChevronDown,
  ChevronUp,
  DollarSign,
  TrendingUp,
  Briefcase,
  PieChart,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Stock } from "./mockData";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface LocationState {
  stock?: Stock;
}

interface DCFInputs {
  revenueGrowthRate: number;
  operatingMargin: number;
  taxRate: number;
  capitalExpenditureRate: number;
  workingCapitalRate: number;
  discountRate: number;
  terminalGrowthRate: number;
  projectionYears: number;
}

interface CompanyMetrics {
  revenueGrowthRate: number;
  operatingMargin: number;
  taxRate: number;
  capitalExpenditureRate: number;
  workingCapitalRate: number;
  wacc: number; // Weighted Average Cost of Capital
  longTermGrowthRate: number;
}

interface CashFlow {
  year: number;
  revenue: number;
  ebit: number;
  taxes: number;
  nopat: number;
  capitalExpenditure: number;
  workingCapitalChange: number;
  freeCashFlow: number;
  discountedCashFlow: number;
  cumulativeDiscountedCashFlow: number;
}

interface DCFResult {
  cashFlows: CashFlow[];
  enterpriseValue: number;
  equityValue: number;
  impliedSharePrice: number;
  upside: number;
  totalPresentValue: number;
  terminalValue: number;
}

const defaultInputs: DCFInputs = {
  revenueGrowthRate: 10, // 10%
  operatingMargin: 20, // 20%
  taxRate: 25, // 25%
  capitalExpenditureRate: 10, // 10% of revenue
  workingCapitalRate: 5, // 5% of revenue
  discountRate: 10, // 10%
  terminalGrowthRate: 3, // 3%
  projectionYears: 5, // 5 years
};

const DCFAnalysisPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { accent } = useTheme();

  const [stock, setStock] = useState<Stock | null>(null);
  const [inputs, setInputs] = useState<DCFInputs>(defaultInputs);
  const [companyMetrics, setCompanyMetrics] = useState<CompanyMetrics | null>(
    null
  );
  const [results, setResults] = useState<DCFResult | null>(null);
  const [showHelp, setShowHelp] = useState(false);
  const [selectedTab, setSelectedTab] = useState<
    "inputs" | "results" | "chart"
  >("inputs");

  // Generate company metrics based on the stock data
  const generateCompanyMetrics = (stock: Stock): CompanyMetrics => {
    // In a real app, these values would come from an API with real financial data
    // For now, we'll generate reasonable values based on the stock sector and other properties

    let metrics: CompanyMetrics = {
      revenueGrowthRate: 0,
      operatingMargin: 0,
      taxRate: 0,
      capitalExpenditureRate: 0,
      workingCapitalRate: 0,
      wacc: 0,
      longTermGrowthRate: 0,
    };

    // Adjust metrics based on sector
    if (stock.sector === "Technology") {
      metrics = {
        revenueGrowthRate: 15 + (Math.random() * 10 - 5), // 10-20%
        operatingMargin: 25 + (Math.random() * 10 - 5), // 20-30%
        taxRate: 22 + (Math.random() * 6 - 3), // 19-25%
        capitalExpenditureRate: 8 + (Math.random() * 4 - 2), // 6-10%
        workingCapitalRate: 4 + (Math.random() * 2 - 1), // 3-5%
        wacc: 9 + (Math.random() * 2 - 1), // 8-10%
        longTermGrowthRate: 3 + (Math.random() * 1 - 0.5), // 2.5-3.5%
      };
    } else if (stock.sector === "Healthcare") {
      metrics = {
        revenueGrowthRate: 10 + (Math.random() * 6 - 3), // 7-13%
        operatingMargin: 20 + (Math.random() * 10 - 5), // 15-25%
        taxRate: 23 + (Math.random() * 4 - 2), // 21-25%
        capitalExpenditureRate: 12 + (Math.random() * 4 - 2), // 10-14%
        workingCapitalRate: 6 + (Math.random() * 2 - 1), // 5-7%
        wacc: 8 + (Math.random() * 2 - 1), // 7-9%
        longTermGrowthRate: 2.5 + (Math.random() * 1 - 0.5), // 2-3%
      };
    } else if (stock.sector === "Financial Services") {
      metrics = {
        revenueGrowthRate: 7 + (Math.random() * 4 - 2), // 5-9%
        operatingMargin: 30 + (Math.random() * 10 - 5), // 25-35%
        taxRate: 25 + (Math.random() * 6 - 3), // 22-28%
        capitalExpenditureRate: 5 + (Math.random() * 2 - 1), // 4-6%
        workingCapitalRate: 3 + (Math.random() * 2 - 1), // 2-4%
        wacc: 10 + (Math.random() * 2 - 1), // 9-11%
        longTermGrowthRate: 2 + (Math.random() * 1 - 0.5), // 1.5-2.5%
      };
    } else if (stock.sector === "Consumer Cyclical") {
      metrics = {
        revenueGrowthRate: 8 + (Math.random() * 6 - 3), // 5-11%
        operatingMargin: 15 + (Math.random() * 6 - 3), // 12-18%
        taxRate: 24 + (Math.random() * 4 - 2), // 22-26%
        capitalExpenditureRate: 7 + (Math.random() * 4 - 2), // 5-9%
        workingCapitalRate: 8 + (Math.random() * 4 - 2), // 6-10%
        wacc: 9 + (Math.random() * 2 - 1), // 8-10%
        longTermGrowthRate: 2.5 + (Math.random() * 1 - 0.5), // 2-3%
      };
    } else {
      // Default for other sectors
      metrics = {
        revenueGrowthRate: 6 + (Math.random() * 4 - 2), // 4-8%
        operatingMargin: 18 + (Math.random() * 6 - 3), // 15-21%
        taxRate: 25 + (Math.random() * 6 - 3), // 22-28%
        capitalExpenditureRate: 10 + (Math.random() * 4 - 2), // 8-12%
        workingCapitalRate: 5 + (Math.random() * 2 - 1), // 4-6%
        wacc: 9 + (Math.random() * 2 - 1), // 8-10%
        longTermGrowthRate: 2 + (Math.random() * 1 - 0.5), // 1.5-2.5%
      };
    }

    // Round all values to 1 decimal place
    Object.keys(metrics).forEach((key) => {
      metrics[key as keyof CompanyMetrics] = parseFloat(
        metrics[key as keyof CompanyMetrics].toFixed(1)
      );
    });

    return metrics;
  };

  // Extract stock from location state
  useEffect(() => {
    const state = location.state as LocationState;
    if (state && state.stock) {
      setStock(state.stock);

      // Generate company metrics based on the stock
      const metrics = generateCompanyMetrics(state.stock);
      setCompanyMetrics(metrics);

      // Set initial inputs based on company metrics
      const updatedInputs = {
        revenueGrowthRate: metrics.revenueGrowthRate,
        operatingMargin: metrics.operatingMargin,
        taxRate: metrics.taxRate,
        capitalExpenditureRate: metrics.capitalExpenditureRate,
        workingCapitalRate: metrics.workingCapitalRate,
        discountRate: metrics.wacc,
        terminalGrowthRate: metrics.longTermGrowthRate,
        projectionYears: 5, // Default projection period
      };

      setInputs(updatedInputs);

      // Calculate initial DCF
      calculateDCF(state.stock, updatedInputs);
    } else {
      // No stock data, redirect back to analysis page
      navigate("/analysis");
    }
  }, [location, navigate]);

  // Handle input changes
  const handleInputChange = (field: keyof DCFInputs, value: string) => {
    const numValue = parseFloat(value);

    // Validate input
    if (isNaN(numValue)) return;

    // Set min/max limits based on field
    let limitedValue = numValue;
    switch (field) {
      case "revenueGrowthRate":
        limitedValue = Math.min(Math.max(numValue, -20), 50); // -20% to 50%
        break;
      case "operatingMargin":
        limitedValue = Math.min(Math.max(numValue, 0), 60); // 0% to 60%
        break;
      case "taxRate":
        limitedValue = Math.min(Math.max(numValue, 0), 40); // 0% to 40%
        break;
      case "capitalExpenditureRate":
        limitedValue = Math.min(Math.max(numValue, 0), 50); // 0% to 50%
        break;
      case "workingCapitalRate":
        limitedValue = Math.min(Math.max(numValue, -10), 20); // -10% to 20%
        break;
      case "discountRate":
        limitedValue = Math.min(Math.max(numValue, 5), 25); // 5% to 25%
        break;
      case "terminalGrowthRate":
        limitedValue = Math.min(Math.max(numValue, 0), 5); // 0% to 5%
        break;
      case "projectionYears":
        limitedValue = Math.min(Math.max(Math.round(numValue), 1), 20); // 1 to 20 years
        break;
    }

    const updatedInputs = { ...inputs, [field]: limitedValue };
    setInputs(updatedInputs);

    // Recalculate DCF with new inputs
    if (stock) {
      calculateDCF(stock, updatedInputs);
    }
  };

  // Calculate DCF
  const calculateDCF = (stock: Stock, inputs: DCFInputs) => {
    // Starting financial metrics
    // In a real app, you'd use actual financial data
    const currentRevenue = (stock.marketCap / stock.pe) * 5; // Rough estimation
    const shares = stock.marketCap / stock.price;
    const debt = stock.marketCap * 0.2; // Assume debt is 20% of market cap
    const cash = stock.marketCap * 0.1; // Assume cash is 10% of market cap

    const cashFlows: CashFlow[] = [];
    let cumulativeDiscountedCashFlow = 0;

    // Calculate projected cash flows
    for (let year = 1; year <= inputs.projectionYears; year++) {
      const growthFactor = Math.pow(1 + inputs.revenueGrowthRate / 100, year);
      const revenue = currentRevenue * growthFactor;
      const ebit = revenue * (inputs.operatingMargin / 100);
      const taxes = ebit * (inputs.taxRate / 100);
      const nopat = ebit - taxes;
      const capitalExpenditure =
        revenue * (inputs.capitalExpenditureRate / 100);
      const workingCapitalChange = revenue * (inputs.workingCapitalRate / 100);
      const freeCashFlow = nopat - capitalExpenditure - workingCapitalChange;

      // Discount the cash flow
      const discountFactor = Math.pow(1 + inputs.discountRate / 100, year);
      const discountedCashFlow = freeCashFlow / discountFactor;
      cumulativeDiscountedCashFlow += discountedCashFlow;

      cashFlows.push({
        year,
        revenue,
        ebit,
        taxes,
        nopat,
        capitalExpenditure,
        workingCapitalChange,
        freeCashFlow,
        discountedCashFlow,
        cumulativeDiscountedCashFlow,
      });
    }

    // Calculate terminal value
    const finalYearCashFlow = cashFlows[cashFlows.length - 1].freeCashFlow;
    const terminalValue =
      (finalYearCashFlow * (1 + inputs.terminalGrowthRate / 100)) /
      (inputs.discountRate / 100 - inputs.terminalGrowthRate / 100);
    const discountedTerminalValue =
      terminalValue /
      Math.pow(1 + inputs.discountRate / 100, inputs.projectionYears);

    // Calculate enterprise and equity value
    const enterpriseValue =
      cumulativeDiscountedCashFlow + discountedTerminalValue;
    const equityValue = enterpriseValue - debt + cash;
    const impliedSharePrice = equityValue / shares;
    const upside = (impliedSharePrice / stock.price - 1) * 100;

    setResults({
      cashFlows,
      enterpriseValue,
      equityValue,
      impliedSharePrice,
      upside,
      totalPresentValue: cumulativeDiscountedCashFlow,
      terminalValue: discountedTerminalValue,
    });
  };

  // Format large numbers
  const formatCurrency = (value: number) => {
    if (value >= 1e12) return `$${(value / 1e12).toFixed(2)}T`;
    if (value >= 1e9) return `$${(value / 1e9).toFixed(2)}B`;
    if (value >= 1e6) return `$${(value / 1e6).toFixed(2)}M`;
    return `$${value.toFixed(2)}`;
  };

  // Go back to analysis page
  const goBack = () => {
    navigate("/analysis");
  };

  if (!stock || !companyMetrics) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin h-8 w-8 border-4 border-blue-500 rounded-full border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 rounded shadow p-6 mb-6">
        <div className="flex justify-between items-start">
          <div>
            <div className="flex items-center gap-3">
              <button
                onClick={goBack}
                className="p-2 rounded-full bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600"
              >
                <ArrowLeft size={16} />
              </button>
              <div>
                <h1 className="text-2xl font-bold flex items-center gap-2">
                  DCF Analysis
                  <span className="text-gray-500 dark:text-gray-400">|</span>
                  <span className="text-xl">{stock.symbol}</span>
                </h1>
                <p className="text-gray-600 dark:text-gray-400">{stock.name}</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-2xl font-bold">${stock.price.toFixed(2)}</p>
              <p
                className={`flex items-center ${
                  stock.change >= 0 ? "text-green-500" : "text-red-500"
                }`}
              >
                {stock.change >= 0 ? (
                  <ChevronUp size={16} />
                ) : (
                  <ChevronDown size={16} />
                )}
                {Math.abs(stock.change).toFixed(2)} (
                {Math.abs(stock.changePercent).toFixed(2)}%)
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => {}} // Would save the model in a real app
                className="flex items-center gap-1"
              >
                <Save size={16} />
                Save Model
              </Button>
              <Button
                variant="solid"
                onClick={() => {}} // Would export as PDF/Excel in a real app
                className="flex items-center gap-1"
              >
                <Download size={16} />
                Export
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white dark:bg-gray-800 rounded shadow mb-6">
        <div className="flex border-b border-gray-200 dark:border-gray-700">
          <button
            onClick={() => setSelectedTab("inputs")}
            className={`py-3 px-6 text-sm font-medium ${
              selectedTab === "inputs"
                ? `border-b-2 border-${accent}-500 text-${accent}-600 dark:text-${accent}-400`
                : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
            }`}
          >
            Model Inputs
          </button>
          <button
            onClick={() => setSelectedTab("results")}
            className={`py-3 px-6 text-sm font-medium ${
              selectedTab === "results"
                ? `border-b-2 border-${accent}-500 text-${accent}-600 dark:text-${accent}-400`
                : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
            }`}
          >
            Results
          </button>
          <button
            onClick={() => setSelectedTab("chart")}
            className={`py-3 px-6 text-sm font-medium ${
              selectedTab === "chart"
                ? `border-b-2 border-${accent}-500 text-${accent}-600 dark:text-${accent}-400`
                : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
            }`}
          >
            Visualization
          </button>
        </div>

        <div className="p-6">
          {/* Inputs Tab */}
          {selectedTab === "inputs" && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-semibold">DCF Model Parameters</h2>
                <Button
                  variant="ghost"
                  onClick={() => setShowHelp(!showHelp)}
                  className="flex items-center gap-1 text-sm"
                >
                  <HelpCircle size={16} />
                  {showHelp ? "Hide Help" : "Show Help"}
                </Button>
              </div>

              {showHelp && (
                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg mb-6">
                  <h3 className="font-medium text-blue-800 dark:text-blue-300 mb-2 flex items-center gap-2">
                    <Info size={18} />
                    What is DCF Analysis?
                  </h3>
                  <p className="text-sm text-blue-700 dark:text-blue-200 mb-4">
                    Discounted Cash Flow (DCF) analysis is a valuation method
                    used to estimate the value of an investment based on its
                    expected future cash flows. By discounting the future cash
                    flows to present value, you can determine whether the
                    current market price is over or undervalued.
                  </p>
                  <h4 className="font-medium text-blue-800 dark:text-blue-300 mb-1">
                    Key Parameters:
                  </h4>
                  <ul className="text-sm text-blue-700 dark:text-blue-200 list-disc pl-5 space-y-1">
                    <li>
                      <span className="font-medium">Revenue Growth Rate:</span>{" "}
                      Annual percentage increase in revenue
                    </li>
                    <li>
                      <span className="font-medium">Operating Margin:</span>{" "}
                      Percentage of revenue that becomes operating profit
                    </li>
                    <li>
                      <span className="font-medium">Discount Rate:</span> Rate
                      used to convert future cash flows to present value (often
                      WACC)
                    </li>
                    <li>
                      <span className="font-medium">Terminal Growth Rate:</span>{" "}
                      Long-term growth rate assumed in perpetuity
                    </li>
                  </ul>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Growth Assumptions */}
                <div>
                  <h3 className="text-md font-medium mb-4 pb-2 border-b border-gray-200 dark:border-gray-700 flex items-center gap-2">
                    <TrendingUp size={18} className="text-gray-500" />
                    Growth Assumptions
                  </h3>

                  <div className="space-y-6">
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <label className="text-sm font-medium">
                          Revenue Growth Rate (%)
                        </label>
                        <span className="text-xs text-gray-500 dark:text-gray-400 py-1 px-2 bg-gray-100 dark:bg-gray-700 rounded">
                          Current 5yr: {companyMetrics.revenueGrowthRate}%
                        </span>
                      </div>
                      <div className="flex items-center">
                        <input
                          type="number"
                          value={inputs.revenueGrowthRate}
                          onChange={(e) =>
                            handleInputChange(
                              "revenueGrowthRate",
                              e.target.value
                            )
                          }
                          min="-20"
                          max="50"
                          step="0.1"
                          className="p-2 w-full border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700"
                        />
                        <div className="ml-2 text-gray-500">%</div>
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        Projected annual revenue growth over the forecast period
                      </p>
                    </div>

                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <label className="text-sm font-medium">
                          Terminal Growth Rate (%)
                        </label>
                        <span className="text-xs text-gray-500 dark:text-gray-400 py-1 px-2 bg-gray-100 dark:bg-gray-700 rounded">
                          Long-term: {companyMetrics.longTermGrowthRate}%
                        </span>
                      </div>
                      <div className="flex items-center">
                        <input
                          type="number"
                          value={inputs.terminalGrowthRate}
                          onChange={(e) =>
                            handleInputChange(
                              "terminalGrowthRate",
                              e.target.value
                            )
                          }
                          min="0"
                          max="5"
                          step="0.1"
                          className="p-2 w-full border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700"
                        />
                        <div className="ml-2 text-gray-500">%</div>
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        Long-term growth rate in perpetuity (usually close to
                        GDP growth)
                      </p>
                    </div>

                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <label className="text-sm font-medium">
                          Projection Years
                        </label>
                        <span className="text-xs text-gray-500 dark:text-gray-400 py-1 px-2 bg-gray-100 dark:bg-gray-700 rounded">
                          Standard: 5 years
                        </span>
                      </div>
                      <div className="flex items-center">
                        <input
                          type="number"
                          value={inputs.projectionYears}
                          onChange={(e) =>
                            handleInputChange("projectionYears", e.target.value)
                          }
                          min="1"
                          max="20"
                          step="1"
                          className="p-2 w-full border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700"
                        />
                        <div className="ml-2 text-gray-500">years</div>
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        Number of years to project future cash flows
                      </p>
                    </div>
                  </div>
                </div>

                {/* Profitability & Valuation Assumptions */}
                <div>
                  <h3 className="text-md font-medium mb-4 pb-2 border-b border-gray-200 dark:border-gray-700 flex items-center gap-2">
                    <PieChart size={18} className="text-gray-500" />
                    Profitability & Valuation
                  </h3>

                  <div className="space-y-6">
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <label className="text-sm font-medium">
                          Operating Margin (%)
                        </label>
                        <span className="text-xs text-gray-500 dark:text-gray-400 py-1 px-2 bg-gray-100 dark:bg-gray-700 rounded">
                          Current: {companyMetrics.operatingMargin}%
                        </span>
                      </div>
                      <div className="flex items-center">
                        <input
                          type="number"
                          value={inputs.operatingMargin}
                          onChange={(e) =>
                            handleInputChange("operatingMargin", e.target.value)
                          }
                          min="0"
                          max="60"
                          step="0.1"
                          className="p-2 w-full border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700"
                        />
                        <div className="ml-2 text-gray-500">%</div>
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        Operating profit as a percentage of revenue
                      </p>
                    </div>

                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <label className="text-sm font-medium">
                          Tax Rate (%)
                        </label>
                        <span className="text-xs text-gray-500 dark:text-gray-400 py-1 px-2 bg-gray-100 dark:bg-gray-700 rounded">
                          Current: {companyMetrics.taxRate}%
                        </span>
                      </div>
                      <div className="flex items-center">
                        <input
                          type="number"
                          value={inputs.taxRate}
                          onChange={(e) =>
                            handleInputChange("taxRate", e.target.value)
                          }
                          min="0"
                          max="40"
                          step="0.1"
                          className="p-2 w-full border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700"
                        />
                        <div className="ml-2 text-gray-500">%</div>
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        Effective tax rate applied to operating profits
                      </p>
                    </div>

                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <label className="text-sm font-medium">
                          Discount Rate (WACC) (%)
                        </label>
                        <span className="text-xs text-gray-500 dark:text-gray-400 py-1 px-2 bg-gray-100 dark:bg-gray-700 rounded">
                          Estimated: {companyMetrics.wacc}%
                        </span>
                      </div>
                      <div className="flex items-center">
                        <input
                          type="number"
                          value={inputs.discountRate}
                          onChange={(e) =>
                            handleInputChange("discountRate", e.target.value)
                          }
                          min="5"
                          max="25"
                          step="0.1"
                          className="p-2 w-full border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700"
                        />
                        <div className="ml-2 text-gray-500">%</div>
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        Weighted Average Cost of Capital used to discount future
                        cash flows
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Additional Inputs */}
              <div className="mt-6">
                <h3 className="text-md font-medium mb-4 pb-2 border-b border-gray-200 dark:border-gray-700 flex items-center gap-2">
                  <Briefcase size={18} className="text-gray-500" />
                  Capital Structure & Working Capital
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <label className="text-sm font-medium">
                        Capital Expenditure (% of Revenue)
                      </label>
                      <span className="text-xs text-gray-500 dark:text-gray-400 py-1 px-2 bg-gray-100 dark:bg-gray-700 rounded">
                        Current: {companyMetrics.capitalExpenditureRate}%
                      </span>
                    </div>
                    <div className="flex items-center">
                      <input
                        type="number"
                        value={inputs.capitalExpenditureRate}
                        onChange={(e) =>
                          handleInputChange(
                            "capitalExpenditureRate",
                            e.target.value
                          )
                        }
                        min="0"
                        max="50"
                        step="0.1"
                        className="p-2 w-full border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700"
                      />
                      <div className="ml-2 text-gray-500">%</div>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Capital expenditures as a percentage of revenue
                    </p>
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <label className="text-sm font-medium">
                        Working Capital (% of Revenue)
                      </label>
                      <span className="text-xs text-gray-500 dark:text-gray-400 py-1 px-2 bg-gray-100 dark:bg-gray-700 rounded">
                        Current: {companyMetrics.workingCapitalRate}%
                      </span>
                    </div>
                    <div className="flex items-center">
                      <input
                        type="number"
                        value={inputs.workingCapitalRate}
                        onChange={(e) =>
                          handleInputChange(
                            "workingCapitalRate",
                            e.target.value
                          )
                        }
                        min="-10"
                        max="20"
                        step="0.1"
                        className="p-2 w-full border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700"
                      />
                      <div className="ml-2 text-gray-500">%</div>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Changes in working capital as a percentage of revenue
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Results Tab */}
          {selectedTab === "results" && results && (
            <div>
              <h2 className="text-lg font-semibold mb-6">
                DCF Valuation Results
              </h2>

              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                <div
                  className={`p-4 rounded-lg bg-${accent}-50 dark:bg-${accent}-900/20 border border-${accent}-200 dark:border-${accent}-800`}
                >
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                    Implied Share Price
                  </h3>
                  <div className="flex items-center">
                    <DollarSign
                      size={18}
                      className={`text-${accent}-600 dark:text-${accent}-400 mr-1`}
                    />
                    <p className="text-2xl font-bold">
                      {results.impliedSharePrice.toFixed(2)}
                    </p>
                  </div>
                  <div
                    className={`text-sm mt-1 ${
                      results.upside >= 0 ? "text-green-500" : "text-red-500"
                    }`}
                  >
                    {results.upside >= 0 ? "+" : ""}
                    {results.upside.toFixed(2)}% vs current
                  </div>
                </div>

                <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700">
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                    Enterprise Value
                  </h3>
                  <p className="text-xl font-bold">
                    {formatCurrency(results.enterpriseValue)}
                  </p>
                </div>

                <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700">
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                    Equity Value
                  </h3>
                  <p className="text-xl font-bold">
                    {formatCurrency(results.equityValue)}
                  </p>
                </div>

                <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700">
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                    Current Price
                  </h3>
                  <p className="text-xl font-bold">${stock.price.toFixed(2)}</p>
                </div>
              </div>

              {/* Value Breakdown */}
              <div className="mb-8">
                <h3 className="text-md font-medium mb-4">Value Breakdown</h3>

                <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm">Present Value of FCF</span>
                        <span className="text-sm font-medium">
                          {formatCurrency(results.totalPresentValue)}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                        <div
                          className={`bg-${accent}-500 h-2.5 rounded-full`}
                          style={{
                            width: `${
                              (results.totalPresentValue /
                                results.enterpriseValue) *
                              100
                            }%`,
                          }}
                        ></div>
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm">
                          Present Value of Terminal Value
                        </span>
                        <span className="text-sm font-medium">
                          {formatCurrency(results.terminalValue)}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                        <div
                          className="bg-blue-500 h-2.5 rounded-full"
                          style={{
                            width: `${
                              (results.terminalValue /
                                results.enterpriseValue) *
                              100
                            }%`,
                          }}
                        ></div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex justify-between mb-1">
                      <span className="text-sm">Total Enterprise Value</span>
                      <span className="text-sm font-medium">
                        {formatCurrency(results.enterpriseValue)}
                      </span>
                    </div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm">- Net Debt</span>
                      <span className="text-sm font-medium">
                        {formatCurrency(
                          results.enterpriseValue - results.equityValue
                        )}
                      </span>
                    </div>
                    <div className="flex justify-between pt-2 border-t border-gray-200 dark:border-gray-700 mt-2">
                      <span className="text-sm font-medium">Equity Value</span>
                      <span className="text-sm font-medium">
                        {formatCurrency(results.equityValue)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Cash Flow Table */}
              <div>
                <h3 className="text-md font-medium mb-4">
                  Projected Cash Flows
                </h3>

                <div className="overflow-x-auto">
                  <table className="min-w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg">
                    <thead>
                      <tr className="bg-gray-50 dark:bg-gray-700">
                        <th className="py-2 px-4 border-b border-gray-200 dark:border-gray-600 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Year
                        </th>
                        <th className="py-2 px-4 border-b border-gray-200 dark:border-gray-600 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Revenue
                        </th>
                        <th className="py-2 px-4 border-b border-gray-200 dark:border-gray-600 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          EBIT
                        </th>
                        <th className="py-2 px-4 border-b border-gray-200 dark:border-gray-600 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          NOPAT
                        </th>
                        <th className="py-2 px-4 border-b border-gray-200 dark:border-gray-600 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          FCF
                        </th>
                        <th className="py-2 px-4 border-b border-gray-200 dark:border-gray-600 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          PV of FCF
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {results.cashFlows.map((cf) => (
                        <tr
                          key={cf.year}
                          className="border-b border-gray-200 dark:border-gray-700 last:border-b-0"
                        >
                          <td className="py-2 px-4 text-sm">
                            {new Date().getFullYear() + cf.year}
                          </td>
                          <td className="py-2 px-4 text-sm text-right">
                            {formatCurrency(cf.revenue)}
                          </td>
                          <td className="py-2 px-4 text-sm text-right">
                            {formatCurrency(cf.ebit)}
                          </td>
                          <td className="py-2 px-4 text-sm text-right">
                            {formatCurrency(cf.nopat)}
                          </td>
                          <td className="py-2 px-4 text-sm text-right">
                            {formatCurrency(cf.freeCashFlow)}
                          </td>
                          <td className="py-2 px-4 text-sm text-right">
                            {formatCurrency(cf.discountedCashFlow)}
                          </td>
                        </tr>
                      ))}
                      <tr className="bg-gray-50 dark:bg-gray-700">
                        <td className="py-2 px-4 text-sm font-medium">
                          Terminal Value (PV)
                        </td>
                        <td colSpan={4} className="py-2 px-4"></td>
                        <td className="py-2 px-4 text-sm font-medium text-right">
                          {formatCurrency(results.terminalValue)}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Chart Tab */}
          {selectedTab === "chart" && results && (
            <div>
              <h2 className="text-lg font-semibold mb-6">
                Cash Flow Visualization
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Projected Cash Flows Chart */}
                <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                  <h3 className="text-md font-medium mb-4">
                    Projected Free Cash Flows
                  </h3>

                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart
                        data={results.cashFlows.map((cf) => ({
                          year: new Date().getFullYear() + cf.year,
                          fcf: cf.freeCashFlow / 1e6, // Convert to millions for better display
                        }))}
                        margin={{ top: 5, right: 20, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid
                          strokeDasharray="3 3"
                          stroke="rgba(156,163,175,0.5)"
                        />
                        <XAxis dataKey="year" />
                        <YAxis tickFormatter={(value) => `$${value}M`} />
                        <Tooltip
                          formatter={(value: number) => [
                            `$${value.toFixed(2)}M`,
                            "Free Cash Flow",
                          ]}
                          labelFormatter={(label) => `Year: ${label}`}
                        />
                        <Line
                          type="monotone"
                          dataKey="fcf"
                          stroke="#3B82F6"
                          strokeWidth={2}
                          dot={{ r: 4 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Cumulative DCF Chart */}
                <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                  <h3 className="text-md font-medium mb-4">
                    Cumulative Discounted Cash Flow
                  </h3>

                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart
                        data={results.cashFlows.map((cf) => ({
                          year: new Date().getFullYear() + cf.year,
                          cumulative: cf.cumulativeDiscountedCashFlow / 1e6, // Convert to millions
                        }))}
                        margin={{ top: 5, right: 20, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid
                          strokeDasharray="3 3"
                          stroke="rgba(156,163,175,0.5)"
                        />
                        <XAxis dataKey="year" />
                        <YAxis tickFormatter={(value) => `$${value}M`} />
                        <Tooltip
                          formatter={(value: number) => [
                            `$${value.toFixed(2)}M`,
                            "Cumulative DCF",
                          ]}
                          labelFormatter={(label) => `Year: ${label}`}
                        />
                        <Line
                          type="monotone"
                          dataKey="cumulative"
                          stroke="#10B981"
                          strokeWidth={2}
                          dot={{ r: 4 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Valuation Breakdown */}
                <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700 md:col-span-2">
                  <h3 className="text-md font-medium mb-4">
                    Valuation Components
                  </h3>

                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart
                        data={[
                          {
                            name: "DCF Components",
                            PV_FCF: results.totalPresentValue / 1e9,
                            PV_Terminal: results.terminalValue / 1e9,
                            Net_Debt:
                              (results.enterpriseValue - results.equityValue) /
                              1e9,
                            Equity_Value: results.equityValue / 1e9,
                          },
                        ]}
                        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis
                          tickFormatter={(value) => `$${value.toFixed(1)}B`}
                        />
                        <Tooltip
                          formatter={(value: number) => [
                            `$${value.toFixed(2)}B`,
                          ]}
                        />
                        <Line
                          type="monotone"
                          dataKey="PV_FCF"
                          name="PV of FCF"
                          stroke="#3B82F6"
                          strokeWidth={2}
                        />
                        <Line
                          type="monotone"
                          dataKey="PV_Terminal"
                          name="PV of Terminal Value"
                          stroke="#10B981"
                          strokeWidth={2}
                        />
                        <Line
                          type="monotone"
                          dataKey="Net_Debt"
                          name="Net Debt"
                          stroke="#EF4444"
                          strokeWidth={2}
                        />
                        <Line
                          type="monotone"
                          dataKey="Equity_Value"
                          name="Equity Value"
                          stroke="#F59E0B"
                          strokeWidth={2}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>

              {/* Sensitivity Analysis */}
              <div className="mt-8">
                <h3 className="text-md font-medium mb-4">Key Sensitivities</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                  The table below shows how the implied share price changes with
                  different combinations of discount rate and terminal growth
                  rate.
                </p>

                <div className="overflow-x-auto">
                  <table className="min-w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg">
                    <thead>
                      <tr className="bg-gray-50 dark:bg-gray-700">
                        <th className="py-2 px-4 border-b border-gray-200 dark:border-gray-600 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Discount Rate ↓ / Terminal Growth →
                        </th>
                        {[
                          inputs.terminalGrowthRate - 1,
                          inputs.terminalGrowthRate,
                          inputs.terminalGrowthRate + 1,
                        ].map((tgr) => (
                          <th
                            key={tgr}
                            className="py-2 px-4 border-b border-gray-200 dark:border-gray-600 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                          >
                            {tgr.toFixed(1)}%
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        inputs.discountRate - 2,
                        inputs.discountRate,
                        inputs.discountRate + 2,
                      ].map((dr) => {
                        // This is a simplified sensitivity calculation - in a real app this would be more complex
                        const baseline = results.impliedSharePrice;
                        const drFactor = inputs.discountRate / dr;

                        return (
                          <tr
                            key={dr}
                            className="border-b border-gray-200 dark:border-gray-700 last:border-b-0"
                          >
                            <td className="py-2 px-4 text-sm font-medium">
                              {dr.toFixed(1)}%
                            </td>
                            {[
                              inputs.terminalGrowthRate - 1,
                              inputs.terminalGrowthRate,
                              inputs.terminalGrowthRate + 1,
                            ].map((tgr, idx) => {
                              // Simplified sensitivity calculation
                              const tgrFactor =
                                (inputs.terminalGrowthRate + 2) / (tgr + 2);
                              const price = (baseline * drFactor) / tgrFactor;
                              const isBaseline =
                                dr === inputs.discountRate &&
                                tgr === inputs.terminalGrowthRate;

                              return (
                                <td
                                  key={idx}
                                  className={`py-2 px-4 text-sm text-center ${
                                    isBaseline
                                      ? `font-bold bg-${accent}-50 dark:bg-${accent}-900/20`
                                      : price > stock.price
                                      ? "text-green-600 dark:text-green-400"
                                      : "text-red-600 dark:text-red-400"
                                  }`}
                                >
                                  ${price.toFixed(2)}
                                  {!isBaseline && (
                                    <span className="text-xs ml-1">
                                      (
                                      {(
                                        (price / stock.price - 1) *
                                        100
                                      ).toFixed(1)}
                                      %)
                                    </span>
                                  )}
                                </td>
                              );
                            })}
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DCFAnalysisPage;
