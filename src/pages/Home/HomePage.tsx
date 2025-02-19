/**
 * File: src/pages/Home/HomePage.tsx
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
    // Remove the extra bg-background and let MainLayout’s background show through
    <div className="w-full h-full overflow-auto">
      {/* Hero / Banner */}
      <div className="p-6 bg-[hsl(var(--accent-700))] text-white">
        <h1 className="text-3xl font-bold mb-2">Welcome to Lysis</h1>
        <p className="text-sm">
          Your personal investment research and analysis workspace
        </p>
      </div>

      {/* Main Content */}
      {/* Use a container-like approach (mx-auto, max-w, etc.) if you want a centered layout */}
      <div className="p-6 max-w-6xl mx-auto grid grid-cols-2 gap-6">
        {/* Left Column */}
        <div className="flex flex-col gap-6">
          {/* Quick Access */}
          <section className="rounded-md p-4 bg-[hsl(var(--accent-50))] text-foreground shadow-sm">
            <h2 className="text-xl font-semibold mb-3">Quick Access</h2>
            <div className="grid grid-cols-3 gap-3">
              {quickAccessItems.map((item) => (
                <div
                  key={item.title}
                  onClick={() => navigate(item.path)}
                  className="bg-surface1 text-foreground rounded-md p-4 cursor-pointer hover:shadow-md transition"
                >
                  <div className="flex flex-col items-center gap-2">
                    {item.icon}
                    <p className="font-bold">{item.title}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Market Overview */}
          <section className="rounded-md p-4 bg-[hsl(var(--accent-50))] text-foreground shadow-sm">
            <h2 className="text-xl font-semibold mb-4">Market Overview</h2>
            <div className="grid grid-cols-3 gap-3">
              {/* Market Trend */}
              <div className="bg-surface1 text-foreground rounded-md p-3">
                <div className="flex items-center gap-2 mb-2">
                  <BarChart size={24} />
                  <p className="font-bold">Market Trend</p>
                </div>
                <p className="text-accent-6 text-lg">Bullish</p>
              </div>
              {/* Volatility */}
              <div className="bg-surface1 text-foreground rounded-md p-3">
                <div className="flex items-center gap-2 mb-2">
                  <Activity size={24} />
                  <p className="font-bold">Volatility</p>
                </div>
                <p className="text-accent-6 text-lg">Moderate</p>
              </div>
              {/* Sentiment */}
              <div className="bg-surface1 text-foreground rounded-md p-3">
                <div className="flex items-center gap-2 mb-2">
                  <BarChart size={24} />
                  <p className="font-bold">Sentiment</p>
                </div>
                <p className="text-accent-6 text-lg">Neutral</p>
              </div>
            </div>
          </section>
        </div>

        {/* Right Column */}
        <div className="flex flex-col gap-6">
          {/* Recently Viewed Terms */}
          <section className="rounded-md p-4 bg-[hsl(var(--accent-50))] text-foreground shadow-sm">
            <h2 className="text-xl font-semibold mb-3">
              Recently Viewed Terms
            </h2>
            <div className="flex flex-col gap-2">
              {recentTerms.map((term) => (
                <div
                  key={term.term}
                  className="border border-borderCard rounded-md p-2 flex justify-between items-center"
                >
                  <p>{term.term}</p>
                  <span className="bg-accent-1 text-accent-9 rounded px-2 py-1 text-xs">
                    {term.category}
                  </span>
                </div>
              ))}
            </div>
          </section>

          {/* Upcoming Events */}
          <section className="rounded-md p-4 bg-[hsl(var(--accent-50))] text-foreground shadow-sm">
            <h2 className="text-xl font-semibold mb-3">Upcoming Events</h2>
            <div className="flex flex-col gap-2">
              {upcomingEvents.map((event) => (
                <div
                  key={event.title}
                  className="border border-borderCard rounded-md p-2 flex flex-col gap-1"
                >
                  <p className="font-bold">{event.title}</p>
                  <div className="flex justify-between items-center">
                    <p className="text-sm text-foreground/70">
                      {new Date(event.date).toLocaleDateString()}
                    </p>
                    <span
                      className={
                        event.type === "earnings"
                          ? "bg-green-500 text-white rounded px-2 py-1 text-xs"
                          : event.type === "economic"
                          ? "bg-blue-500 text-white rounded px-2 py-1 text-xs"
                          : "bg-orange-500 text-white rounded px-2 py-1 text-xs"
                      }
                    >
                      {event.type}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};
