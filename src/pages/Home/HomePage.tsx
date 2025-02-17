/**
 * File: src/pages/Home/HomePage.tsx
 * Description: Main dashboard/home page component using shadcn styling with Tailwind CSS and lucide-react icons
 */

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Activity,
  BarChart,
  Bookmark,
  Bell,
  File,
  Calendar,
  FileText,
} from "lucide-react";

export const HomePage = () => {
  const navigate = useNavigate();
  const [recentTerms] = useState([
    { term: "P/E Ratio", category: "ratios" },
    { term: "Market Cap", category: "fundamentals" },
    { term: "Beta", category: "market" },
  ]);

  const quickAccessItems = [
    {
      title: "Glossary",
      icon: <Bookmark size={24} />,
      path: "/glossary",
    },
    {
      title: "Alerts",
      icon: <Bell size={24} />,
      path: "/alerts",
    },
    {
      title: "Files",
      icon: <File size={24} />,
      path: "/files",
    },
    {
      title: "Calendar",
      icon: <Calendar size={24} />,
      path: "/calendar",
    },
    {
      title: "Research",
      icon: <FileText size={24} />,
      path: "/notes",
    },
  ];

  const upcomingEvents = [
    {
      title: "AAPL Earnings Call",
      date: "2024-04-30",
      type: "earnings",
    },
    {
      title: "Fed Interest Rate Decision",
      date: "2024-05-01",
      type: "economic",
    },
    {
      title: "MSFT Dividend Ex-Date",
      date: "2024-05-15",
      type: "dividend",
    },
  ];

  return (
    <div className="container mx-auto p-4 max-w-7xl">
      {/* Welcome Section */}
      <div className="bg-white rounded shadow p-6 mb-4">
        <h2 className="text-2xl font-bold mb-2">Welcome to Lysis</h2>
        <p className="text-gray-600">
          Your personal investment research and analysis workspace
        </p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {/* Quick Access Grid */}
        <div className="col-span-2">
          <h3 className="text-xl font-semibold mb-4">Quick Access</h3>
          <div className="grid grid-cols-3 gap-3">
            {quickAccessItems.map((item) => (
              <div
                key={item.title}
                onClick={() => navigate(item.path)}
                className="bg-white rounded shadow p-4 cursor-pointer hover:shadow-lg transition-shadow"
              >
                <div className="flex flex-col items-center gap-2">
                  {item.icon}
                  <p className="font-bold">{item.title}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Market Overview */}
          <h3 className="text-xl font-semibold mt-6 mb-4">Market Overview</h3>
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-white rounded shadow p-4">
              <div className="flex items-center gap-2 mb-2">
                <BarChart size={24} />
                <p className="font-bold">Market Trend</p>
              </div>
              <p className="text-blue-500 text-lg">Bullish</p>
            </div>
            <div className="bg-white rounded shadow p-4">
              <div className="flex items-center gap-2 mb-2">
                <Activity size={24} />
                <p className="font-bold">Volatility</p>
              </div>
              <p className="text-blue-500 text-lg">Moderate</p>
            </div>
            <div className="bg-white rounded shadow p-4">
              <div className="flex items-center gap-2 mb-2">
                <BarChart size={24} />
                <p className="font-bold">Sentiment</p>
              </div>
              <p className="text-blue-500 text-lg">Neutral</p>
            </div>
          </div>
        </div>

        {/* Right Side Panels */}
        <div className="space-y-4">
          {/* Recently Viewed Terms */}
          <div className="bg-white rounded shadow p-4">
            <h4 className="text-lg font-semibold mb-3">
              Recently Viewed Terms
            </h4>
            <div className="flex flex-col gap-2">
              {recentTerms.map((term) => (
                <div
                  key={term.term}
                  className="border border-gray-200 rounded p-2 flex justify-between items-center"
                >
                  <p>{term.term}</p>
                  <span className="bg-gray-200 rounded px-2 py-1 text-sm">
                    {term.category}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Upcoming Events */}
          <div className="bg-white rounded shadow p-4">
            <h4 className="text-lg font-semibold mb-3">Upcoming Events</h4>
            <div className="flex flex-col gap-2">
              {upcomingEvents.map((event) => (
                <div
                  key={event.title}
                  className="border border-gray-200 rounded p-2 flex flex-col gap-1"
                >
                  <p className="font-bold">{event.title}</p>
                  <div className="flex justify-between items-center">
                    <p className="text-sm text-gray-600">
                      {new Date(event.date).toLocaleDateString()}
                    </p>
                    <span
                      className={
                        event.type === "earnings"
                          ? "bg-green-500 text-white rounded px-2 py-1 text-sm"
                          : event.type === "economic"
                          ? "bg-blue-500 text-white rounded px-2 py-1 text-sm"
                          : "bg-orange-500 text-white rounded px-2 py-1 text-sm"
                      }
                    >
                      {event.type}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
