/**
 * File: src/pages/Analysis/AnalysisPage.tsx
 * Description: Enhanced analysis page with watchlists, stock details, charts, and price alerts
 */

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "@/theme/hooks/useTheme";
import {
  Plus,
  Edit,
  Trash,
  ChevronDown,
  ChevronUp,
  BarChart2,
  Bell,
  X,
  Search,
} from "lucide-react";

// Mock data
import {
  mockStockData,
  mockWatchlists,
  mockAlerts,
  Stock,
  Watchlist,
  PriceAlert,
} from "./mockData";

// Components
import StockChart from "./components/StockChart";
import { Button } from "@/components/ui/button";

// Interface definitions for props
interface CreateWatchlistProps {
  onClose: () => void;
  onCreateWatchlist: (name: string) => void;
}

interface PriceAlertDialogProps {
  stock: Stock | null;
  onClose: () => void;
  onCreateAlert: (alert: Omit<PriceAlert, "id" | "createdAt">) => void;
}

// CreateWatchlist Dialog Component
const CreateWatchlistDialog: React.FC<CreateWatchlistProps> = ({
  onClose,
  onCreateWatchlist,
}) => {
  const { mode } = useTheme();
  const isDark = mode === "dark";
  const [watchlistName, setWatchlistName] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (watchlistName.trim()) {
      onCreateWatchlist(watchlistName.trim());
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div
        className={`w-96 rounded-lg shadow-lg p-6 ${
          isDark ? "bg-gray-800" : "bg-white"
        }`}
      >
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold">Create New Watchlist</h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X size={20} />
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">
              Watchlist Name
            </label>
            <input
              type="text"
              value={watchlistName}
              onChange={(e) => setWatchlistName(e.target.value)}
              className={`w-full p-2 border rounded ${
                isDark
                  ? "bg-gray-700 border-gray-600"
                  : "bg-white border-gray-300"
              }`}
              placeholder="Enter watchlist name"
              autoFocus
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button
              variant="ghost"
              onClick={onClose}
              className="text-sm py-1 px-3"
            >
              Cancel
            </Button>
            <Button
              variant="solid"
              type="submit"
              disabled={!watchlistName.trim()}
              className="text-sm py-1 px-3"
            >
              Create Watchlist
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

// PriceAlert Dialog Component
const PriceAlertDialog: React.FC<PriceAlertDialogProps> = ({
  stock,
  onClose,
  onCreateAlert,
}) => {
  const { mode } = useTheme();
  const isDark = mode === "dark";
  const [targetPrice, setTargetPrice] = useState("");
  const [isAbove, setIsAbove] = useState(true);

  if (!stock) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const price = parseFloat(targetPrice);
    if (isNaN(price) || price <= 0) return;

    onCreateAlert({
      stockSymbol: stock.symbol,
      targetPrice: price,
      isAbove: isAbove,
      isActive: true,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div
        className={`w-96 rounded-lg shadow-lg p-6 ${
          isDark ? "bg-gray-800" : "bg-white"
        }`}
      >
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold">
            Set Price Alert for {stock.symbol}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X size={20} />
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">
              Current Price: ${stock.price.toFixed(2)}
            </label>
            <div className="flex gap-2 mb-3">
              <button
                type="button"
                onClick={() => setIsAbove(true)}
                className={`flex-1 py-2 px-3 rounded text-sm ${
                  isAbove
                    ? "bg-blue-500 text-white"
                    : isDark
                    ? "bg-gray-700"
                    : "bg-gray-200"
                }`}
              >
                Alert Above
              </button>
              <button
                type="button"
                onClick={() => setIsAbove(false)}
                className={`flex-1 py-2 px-3 rounded text-sm ${
                  !isAbove
                    ? "bg-blue-500 text-white"
                    : isDark
                    ? "bg-gray-700"
                    : "bg-gray-200"
                }`}
              >
                Alert Below
              </button>
            </div>
            <label className="block text-sm font-medium mb-1">
              Target Price ($)
            </label>
            <input
              type="number"
              value={targetPrice}
              onChange={(e) => setTargetPrice(e.target.value)}
              step="0.01"
              min="0.01"
              className={`w-full p-2 border rounded ${
                isDark
                  ? "bg-gray-700 border-gray-600"
                  : "bg-white border-gray-300"
              }`}
              placeholder="Enter target price"
              autoFocus
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button
              variant="ghost"
              onClick={onClose}
              className="text-sm py-1 px-3"
            >
              Cancel
            </Button>
            <Button
              variant="solid"
              type="submit"
              disabled={!targetPrice || parseFloat(targetPrice) <= 0}
              className="text-sm py-1 px-3"
            >
              Create Alert
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Financial metrics component
const FinancialMetrics: React.FC<{ stock: Stock }> = ({ stock }) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
      <div className="p-3 rounded bg-gray-100 dark:bg-gray-800">
        <p className="text-xs text-gray-500 dark:text-gray-400">Market Cap</p>
        <p className="text-lg font-semibold">
          ${(stock.marketCap / 1000000000).toFixed(2)}B
        </p>
      </div>
      <div className="p-3 rounded bg-gray-100 dark:bg-gray-800">
        <p className="text-xs text-gray-500 dark:text-gray-400">P/E Ratio</p>
        <p className="text-lg font-semibold">{stock.pe.toFixed(2)}</p>
      </div>
      <div className="p-3 rounded bg-gray-100 dark:bg-gray-800">
        <p className="text-xs text-gray-500 dark:text-gray-400">EPS</p>
        <p className="text-lg font-semibold">${stock.eps.toFixed(2)}</p>
      </div>
      <div className="p-3 rounded bg-gray-100 dark:bg-gray-800">
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Dividend Yield
        </p>
        <p className="text-lg font-semibold">
          {stock.dividendYield.toFixed(2)}%
        </p>
      </div>
    </div>
  );
};

// Main Analysis Page Component
export const AnalysisPage: React.FC = () => {
  const { accent } = useTheme(); // Removed 'mode' as it wasn't being used
  const navigate = useNavigate();

  // State management
  const [watchlists, setWatchlists] = useState<Watchlist[]>(mockWatchlists);
  const [selectedWatchlistId, setSelectedWatchlistId] = useState<string | null>(
    watchlists.length > 0 ? watchlists[0].id : null
  );
  const [selectedStock, setSelectedStock] = useState<Stock | null>(null);
  const [stockData] = useState<Record<string, Stock>>(mockStockData);
  const [priceAlerts, setPriceAlerts] = useState<PriceAlert[]>(mockAlerts);
  const [showCreateWatchlist, setShowCreateWatchlist] = useState(false);
  const [showCreateAlert, setShowCreateAlert] = useState(false);
  const [isEditingWatchlist, setIsEditingWatchlist] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // Find the selected watchlist
  const selectedWatchlist =
    watchlists.find((w) => w.id === selectedWatchlistId) || null;

  // Filter stocks based on search term
  const filteredStockSymbols = selectedWatchlist
    ? selectedWatchlist.stocks.filter(
        (symbol) =>
          symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
          stockData[symbol]?.name
            .toLowerCase()
            .includes(searchTerm.toLowerCase())
      )
    : [];

  // Create a new watchlist
  const handleCreateWatchlist = (name: string) => {
    const newWatchlist: Watchlist = {
      id: `watchlist-${Date.now()}`,
      name,
      stocks: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    setWatchlists((prev) => [...prev, newWatchlist]);
    setSelectedWatchlistId(newWatchlist.id);
  };

  // Delete a watchlist
  const handleDeleteWatchlist = (id: string) => {
    if (window.confirm("Are you sure you want to delete this watchlist?")) {
      setWatchlists((prev) => prev.filter((w) => w.id !== id));
      if (selectedWatchlistId === id) {
        setSelectedWatchlistId(watchlists.length > 1 ? watchlists[0].id : null);
      }
    }
  };

  // Add a stock to the current watchlist
  const handleAddStock = () => {
    // This would typically open a stock search dialog
    // For now, we'll just add a mock stock
    if (!selectedWatchlistId) return;

    const existingSymbols = new Set(selectedWatchlist?.stocks || []);
    const availableSymbols = Object.keys(stockData).filter(
      (symbol) => !existingSymbols.has(symbol)
    );

    if (availableSymbols.length > 0) {
      const randomSymbol =
        availableSymbols[Math.floor(Math.random() * availableSymbols.length)];

      setWatchlists((prev) =>
        prev.map((w) =>
          w.id === selectedWatchlistId
            ? {
                ...w,
                stocks: [...w.stocks, randomSymbol],
                updatedAt: new Date(),
              }
            : w
        )
      );
    }
  };

  // Remove a stock from the current watchlist
  const handleRemoveStock = (symbol: string) => {
    if (!selectedWatchlistId) return;

    setWatchlists((prev) =>
      prev.map((w) =>
        w.id === selectedWatchlistId
          ? {
              ...w,
              stocks: w.stocks.filter((s) => s !== symbol),
              updatedAt: new Date(),
            }
          : w
      )
    );

    if (selectedStock?.symbol === symbol) {
      setSelectedStock(null);
    }
  };

  // Create a new price alert
  const handleCreateAlert = (
    alertData: Omit<PriceAlert, "id" | "createdAt">
  ) => {
    const newAlert: PriceAlert = {
      ...alertData,
      id: `alert-${Date.now()}`,
      createdAt: new Date(),
    };

    setPriceAlerts((prev) => [...prev, newAlert]);
  };

  // Delete a price alert
  const handleDeleteAlert = (id: string) => {
    setPriceAlerts((prev) => prev.filter((alert) => alert.id !== id));
  };

  // Toggle a price alert's active status
  const handleToggleAlertStatus = (id: string) => {
    setPriceAlerts((prev) =>
      prev.map((alert) =>
        alert.id === id ? { ...alert, isActive: !alert.isActive } : alert
      )
    );
  };

  // Navigate to DCF analysis page
  const navigateToDCF = () => {
    navigate("/analysis/dcf", { state: { stock: selectedStock } });
  };

  return (
    <div className="p-6">
      {/* Header Section */}
      <div className="bg-white dark:bg-gray-800 rounded shadow p-6 mb-6">
        <h1 className="text-2xl font-bold mb-2">Analysis</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Manage your watchlists and analyze stocks
        </p>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Watchlists Panel */}
        <div className="bg-white dark:bg-gray-800 rounded shadow">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
            <h2 className="text-lg font-semibold">Watchlists</h2>
            <Button
              onClick={() => setShowCreateWatchlist(true)}
              className="flex items-center gap-1"
            >
              <Plus size={16} />
              New List
            </Button>
          </div>

          {/* Watchlist Selector */}
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex flex-wrap gap-2">
              {watchlists.map((watchlist) => (
                <button
                  key={watchlist.id}
                  onClick={() => setSelectedWatchlistId(watchlist.id)}
                  className={`px-3 py-1 rounded-full text-sm 
                    ${
                      selectedWatchlistId === watchlist.id
                        ? `bg-${accent}-600 text-white`
                        : "bg-gray-200 dark:bg-gray-700"
                    }
                  `}
                >
                  {watchlist.name} ({watchlist.stocks.length})
                </button>
              ))}
            </div>
          </div>

          {/* Selected Watchlist */}
          {selectedWatchlist && (
            <>
              <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <h3 className="font-bold">{selectedWatchlist.name}</h3>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {selectedWatchlist.stocks.length} stocks
                  </span>
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={() => setIsEditingWatchlist(!isEditingWatchlist)}
                    className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700"
                  >
                    <Edit size={16} />
                  </button>
                  <button
                    onClick={() => handleDeleteWatchlist(selectedWatchlist.id)}
                    className="p-1 rounded hover:bg-red-100 dark:hover:bg-red-900 text-red-500"
                  >
                    <Trash size={16} />
                  </button>
                </div>
              </div>

              {/* Search Stocks */}
              <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search size={16} className="text-gray-400" />
                  </div>
                  <input
                    type="text"
                    placeholder="Search in watchlist..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-3 py-2 w-full border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700"
                  />
                </div>
              </div>

              {/* Stock List */}
              <div
                className="overflow-y-auto"
                style={{ height: "calc(100vh - 500px)" }}
              >
                {filteredStockSymbols.length === 0 ? (
                  <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                    {searchTerm
                      ? "No matching stocks found"
                      : "No stocks in this watchlist yet"}
                  </div>
                ) : (
                  filteredStockSymbols.map((symbol) => {
                    const stock = stockData[symbol];
                    if (!stock) return null;

                    return (
                      <div
                        key={symbol}
                        className={`p-3 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-750 ${
                          selectedStock?.symbol === symbol
                            ? "bg-blue-50 dark:bg-blue-900/20"
                            : ""
                        }`}
                        onClick={() => setSelectedStock(stock)}
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold">{symbol}</span>
                            <span className="text-gray-600 dark:text-gray-400 text-sm truncate">
                              {stock.name}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-sm font-semibold">
                              ${stock.price.toFixed(2)}
                            </span>
                            <span
                              className={`text-xs ${
                                stock.change >= 0
                                  ? "text-green-500"
                                  : "text-red-500"
                              }`}
                            >
                              {stock.change >= 0 ? "+" : ""}
                              {stock.change.toFixed(2)} (
                              {stock.changePercent.toFixed(2)}%)
                            </span>
                          </div>
                        </div>
                        {isEditingWatchlist && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRemoveStock(symbol);
                            }}
                            className="p-1 rounded hover:bg-red-100 dark:hover:bg-red-900/50 text-red-500"
                          >
                            <Trash size={16} />
                          </button>
                        )}
                      </div>
                    );
                  })
                )}
              </div>

              {/* Add Stock Button (only visible in edit mode) */}
              {isEditingWatchlist && (
                <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                  <Button
                    onClick={handleAddStock}
                    className="w-full flex items-center justify-center gap-1"
                  >
                    <Plus size={16} />
                    Add Stock
                  </Button>
                </div>
              )}
            </>
          )}
        </div>

        {/* Stock Details Panel */}
        <div className="lg:col-span-2">
          {selectedStock ? (
            <div className="bg-white dark:bg-gray-800 rounded shadow mb-6">
              {/* Stock Header */}
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-xl font-bold">
                        {selectedStock.symbol}
                      </h2>
                      <span className="text-gray-600 dark:text-gray-400">
                        {selectedStock.name}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 mt-2">
                      <span className="text-2xl font-bold">
                        ${selectedStock.price.toFixed(2)}
                      </span>
                      <span
                        className={`flex items-center ${
                          selectedStock.change >= 0
                            ? "text-green-500"
                            : "text-red-500"
                        }`}
                      >
                        {selectedStock.change >= 0 ? (
                          <ChevronUp size={20} />
                        ) : (
                          <ChevronDown size={20} />
                        )}
                        {Math.abs(selectedStock.change).toFixed(2)} (
                        {Math.abs(selectedStock.changePercent).toFixed(2)}%)
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => setShowCreateAlert(true)}
                      className="flex items-center gap-1"
                    >
                      <Bell size={16} />
                      Set Alert
                    </Button>
                    <Button
                      onClick={navigateToDCF}
                      className="flex items-center gap-1"
                    >
                      <BarChart2 size={16} />
                      DCF Analysis
                    </Button>
                  </div>
                </div>

                {/* Key Metrics Grid */}
                <FinancialMetrics stock={selectedStock} />
              </div>

              {/* Stock Chart */}
              <div className="p-6">
                <h3 className="text-lg font-semibold mb-4">Price Chart</h3>
                <div className="h-64">
                  <StockChart symbol={selectedStock.symbol} />
                </div>
              </div>

              {/* Additional Stock Details (Sector, Industry, etc.) */}
              <div className="p-6 border-t border-gray-200 dark:border-gray-700">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Sector
                    </p>
                    <p className="font-medium">{selectedStock.sector}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Industry
                    </p>
                    <p className="font-medium">{selectedStock.industry}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Beta
                    </p>
                    <p className="font-medium">
                      {selectedStock.beta.toFixed(2)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Volume
                    </p>
                    <p className="font-medium">
                      {selectedStock.volume.toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>

              {/* Price Alerts for this Stock */}
              <div className="p-6 border-t border-gray-200 dark:border-gray-700">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold">Price Alerts</h3>
                  <Button
                    onClick={() => setShowCreateAlert(true)}
                    className="flex items-center gap-1 text-sm"
                  >
                    <Plus size={14} />
                    New Alert
                  </Button>
                </div>

                {priceAlerts.filter(
                  (alert) => alert.stockSymbol === selectedStock.symbol
                ).length === 0 ? (
                  <p className="text-gray-500 dark:text-gray-400 text-sm">
                    No price alerts set for this stock
                  </p>
                ) : (
                  <div className="space-y-2">
                    {priceAlerts
                      .filter(
                        (alert) => alert.stockSymbol === selectedStock.symbol
                      )
                      .map((alert) => (
                        <div
                          key={alert.id}
                          className="p-3 border border-gray-200 dark:border-gray-700 rounded flex justify-between items-center"
                        >
                          <div className="flex items-center gap-2">
                            <Bell
                              size={16}
                              className={
                                alert.isActive
                                  ? "text-blue-500"
                                  : "text-gray-400"
                              }
                            />
                            <div>
                              <p className="font-medium">
                                Alert when price goes{" "}
                                {alert.isAbove ? "above" : "below"} $
                                {alert.targetPrice.toFixed(2)}
                              </p>
                              <p className="text-xs text-gray-500 dark:text-gray-400">
                                Created on{" "}
                                {new Date(alert.createdAt).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleToggleAlertStatus(alert.id)}
                              className={`p-1 rounded ${
                                alert.isActive
                                  ? "hover:bg-gray-200 dark:hover:bg-gray-700"
                                  : "hover:bg-green-100 dark:hover:bg-green-900/20 text-green-500"
                              }`}
                            >
                              {alert.isActive ? (
                                <Bell size={16} />
                              ) : (
                                <Bell size={16} />
                              )}
                            </button>
                            <button
                              onClick={() => handleDeleteAlert(alert.id)}
                              className="p-1 rounded hover:bg-red-100 dark:hover:bg-red-900/50 text-red-500"
                            >
                              <Trash size={16} />
                            </button>
                          </div>
                        </div>
                      ))}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div
              className="bg-white dark:bg-gray-800 rounded shadow p-6 flex flex-col items-center justify-center"
              style={{ minHeight: "400px" }}
            >
              <div className="flex flex-col items-center text-center max-w-md">
                <BarChart2
                  size={64}
                  className="text-gray-300 dark:text-gray-600 mb-4"
                />
                <h3 className="text-xl font-bold mb-2">
                  Select a Stock to Analyze
                </h3>
                <p className="text-gray-500 dark:text-gray-400 mb-6">
                  Choose a stock from your watchlist to view detailed
                  information, charts, and set up price alerts.
                </p>
                {watchlists.length === 0 && (
                  <Button
                    onClick={() => setShowCreateWatchlist(true)}
                    className="flex items-center gap-1"
                  >
                    <Plus size={16} />
                    Create Your First Watchlist
                  </Button>
                )}
              </div>
            </div>
          )}

          {/* All Price Alerts Section */}
          <div className="bg-white dark:bg-gray-800 rounded shadow">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="font-bold">All Price Alerts</h3>
            </div>

            {priceAlerts.length === 0 ? (
              <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                No price alerts created yet
              </div>
            ) : (
              <div className="divide-y divide-gray-200 dark:divide-gray-700">
                {priceAlerts.map((alert) => {
                  const stock = stockData[alert.stockSymbol];
                  if (!stock) return null;

                  // Calculate how close we are to the alert
                  const priceDiff = alert.isAbove
                    ? alert.targetPrice - stock.price
                    : stock.price - alert.targetPrice;

                  const percentDiff = (priceDiff / stock.price) * 100;
                  const isTriggeredSoon = priceDiff > 0 && percentDiff < 5; // Within 5%
                  const isTriggered =
                    (alert.isAbove && stock.price >= alert.targetPrice) ||
                    (!alert.isAbove && stock.price <= alert.targetPrice);

                  return (
                    <div
                      key={alert.id}
                      className={`p-4 flex justify-between items-center ${
                        isTriggered
                          ? "bg-blue-50 dark:bg-blue-900/20"
                          : isTriggeredSoon
                          ? "bg-yellow-50 dark:bg-yellow-900/20"
                          : ""
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="relative flex-shrink-0 w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                          <span className="font-bold text-sm">
                            {alert.stockSymbol.slice(0, 2)}
                          </span>
                          <div className="absolute -bottom-1 -right-1">
                            <Bell
                              size={14}
                              className={`${
                                alert.isActive
                                  ? isTriggered
                                    ? "text-blue-500"
                                    : "text-gray-600 dark:text-gray-300"
                                  : "text-gray-400 dark:text-gray-500"
                              }`}
                            />
                          </div>
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium">
                              {alert.stockSymbol}
                            </span>
                            <span className="text-sm text-gray-600 dark:text-gray-400 max-w-[220px] truncate">
                              {stock.name}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 mt-0.5">
                            <p className="text-sm flex items-center gap-1">
                              <span
                                className={`${
                                  alert.isAbove
                                    ? "text-green-500"
                                    : "text-red-500"
                                }`}
                              >
                                {alert.isAbove ? "↑" : "↓"}
                              </span>
                              <span>
                                {alert.isAbove ? "Above" : "Below"} $
                                {alert.targetPrice.toFixed(2)}
                              </span>
                              {isTriggered && (
                                <span className="ml-2 text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 px-1.5 py-0.5 rounded">
                                  Triggered
                                </span>
                              )}
                              {!isTriggered && isTriggeredSoon && (
                                <span className="ml-2 text-xs bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300 px-1.5 py-0.5 rounded">
                                  Close to target
                                </span>
                              )}
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <div className="text-right mr-4">
                          <p className="font-medium">
                            ${stock.price.toFixed(2)}
                          </p>
                          <p
                            className={`text-xs ${
                              stock.change >= 0
                                ? "text-green-500"
                                : "text-red-500"
                            }`}
                          >
                            {stock.change >= 0 ? "+" : ""}
                            {stock.change.toFixed(2)} (
                            {stock.changePercent.toFixed(2)}%)
                          </p>
                        </div>
                        <div className="flex gap-1">
                          <button
                            onClick={() => handleToggleAlertStatus(alert.id)}
                            className={`p-1.5 rounded-full ${
                              alert.isActive
                                ? "bg-gray-200 dark:bg-gray-700"
                                : "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300"
                            }`}
                            title={
                              alert.isActive ? "Disable alert" : "Enable alert"
                            }
                          >
                            {alert.isActive ? (
                              <Bell size={16} />
                            ) : (
                              <Bell size={16} />
                            )}
                          </button>
                          <button
                            onClick={() => handleDeleteAlert(alert.id)}
                            className="p-1.5 rounded-full bg-gray-200 hover:bg-red-100 dark:bg-gray-700 dark:hover:bg-red-900/30 text-gray-700 hover:text-red-600 dark:text-gray-300 dark:hover:text-red-400"
                            title="Delete alert"
                          >
                            <Trash size={16} />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Dialogs */}
      {showCreateWatchlist && (
        <CreateWatchlistDialog
          onClose={() => setShowCreateWatchlist(false)}
          onCreateWatchlist={handleCreateWatchlist}
        />
      )}

      {showCreateAlert && selectedStock && (
        <PriceAlertDialog
          stock={selectedStock}
          onClose={() => setShowCreateAlert(false)}
          onCreateAlert={handleCreateAlert}
        />
      )}
    </div>
  );
};

export default AnalysisPage;
