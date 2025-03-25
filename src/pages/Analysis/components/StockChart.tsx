/**
 * File: src/pages/Analysis/components/StockChart.tsx
 * Description: Chart component for displaying stock price history
 */

import React, { useState, useEffect } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useTheme } from "@/theme/hooks/useTheme";

interface StockDataPoint {
  date: string;
  price: number;
  volume: number;
}

// Mock historical price data generator
const generateMockHistoricalData = (
  symbol: string,
  days: number = 90
): StockDataPoint[] => {
  const data: StockDataPoint[] = [];
  const startPrice = Math.random() * 100 + 50; // Random start price between 50 and 150
  let price = startPrice;

  const now = new Date();

  for (let i = days; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);

    // Generate a random price movement, more volatile for tech stocks
    const volatility = symbol.startsWith("TECH") ? 0.03 : 0.015;
    const change = (Math.random() - 0.5) * 2 * volatility * price;
    price += change;

    // Ensure price doesn't go below 1
    price = Math.max(price, 1);

    data.push({
      date: date.toISOString().split("T")[0],
      price: parseFloat(price.toFixed(2)),
      volume: Math.floor(Math.random() * 10000000) + 500000,
    });
  }

  return data;
};

interface StockChartProps {
  symbol: string;
  timeRange?: "1D" | "1W" | "1M" | "3M" | "1Y" | "5Y";
}

const StockChart: React.FC<StockChartProps> = ({
  symbol,
  timeRange = "3M",
}) => {
  const { mode, accent } = useTheme();
  const isDark = mode === "dark";

  const [data, setData] = useState<StockDataPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRange, setSelectedRange] = useState<
    "1D" | "1W" | "1M" | "3M" | "1Y" | "5Y"
  >(timeRange);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);

      // In a real app, you would fetch actual data from an API
      // For this example, we'll generate mock data
      let days = 0;
      switch (selectedRange) {
        case "1D":
          days = 1;
          break;
        case "1W":
          days = 7;
          break;
        case "1M":
          days = 30;
          break;
        case "3M":
          days = 90;
          break;
        case "1Y":
          days = 365;
          break;
        case "5Y":
          days = 365 * 5;
          break;
      }

      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 500));

      const historicalData = generateMockHistoricalData(symbol, days);
      setData(historicalData);
      setLoading(false);
    };

    fetchData();
  }, [symbol, selectedRange]);

  // Calculate if the current price is higher than the start price
  const isPositive =
    data.length >= 2 && data[data.length - 1].price > data[0].price;
  const chartColor = isPositive ? "#22c55e" : "#ef4444"; // green or red

  // Time range buttons
  const timeRanges: Array<"1D" | "1W" | "1M" | "3M" | "1Y" | "5Y"> = [
    "1D",
    "1W",
    "1M",
    "3M",
    "1Y",
    "5Y",
  ];

  return (
    <div className="w-full">
      <div className="flex justify-end gap-1 mb-4">
        {timeRanges.map((range) => (
          <button
            key={range}
            onClick={() => setSelectedRange(range)}
            className={`px-2 py-1 text-xs rounded ${
              selectedRange === range
                ? `bg-${accent}-500 text-white`
                : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
            }`}
          >
            {range}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="h-64 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-400"></div>
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={250}>
          <LineChart
            data={data}
            margin={{ top: 5, right: 5, left: 5, bottom: 5 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke={isDark ? "#374151" : "#e5e7eb"}
            />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 12 }}
              tickFormatter={(value: string) => {
                // Format based on time range
                if (selectedRange === "1D") {
                  return new Date(value).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  });
                }
                if (selectedRange === "1W" || selectedRange === "1M") {
                  return new Date(value).toLocaleDateString([], {
                    month: "short",
                    day: "numeric",
                  });
                }
                return new Date(value).toLocaleDateString([], {
                  month: "short",
                  year: "2-digit",
                });
              }}
            />
            <YAxis
              domain={["auto", "auto"]}
              tick={{ fontSize: 12 }}
              tickFormatter={(value: number) => `$${value}`}
            />
            <Tooltip
              formatter={(value: number) => [`$${value.toFixed(2)}`, "Price"]}
              labelFormatter={(label: string) =>
                new Date(label).toLocaleDateString([], {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })
              }
              contentStyle={{
                backgroundColor: isDark ? "#1f2937" : "white",
                borderColor: isDark ? "#374151" : "#e5e7eb",
              }}
            />
            <Line
              type="monotone"
              dataKey="price"
              stroke={chartColor}
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4 }}
            />
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  );
};

export default StockChart;
