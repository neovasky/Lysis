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
  Folder,
  Calendar,
  FileText,
} from "lucide-react";
import { Card } from "@/components/ui/card";

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
      icon: <Folder size={24} />,
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
    <div
      className="w-full h-full overflow-auto"
      style={{ color: "hsl(var(--body-foreground))" }}
    >
      {/* Hero / Banner */}
      <div
        className="p-6"
        style={{
          backgroundColor: "hsl(var(--accent-700))",
          color: "var(--accent-foreground)",
        }}
      >
        <h1 className="text-3xl font-bold mb-2">Welcome to Lysis</h1>
        <p className="text-sm">
          Your personal investment research and analysis workspace
        </p>
      </div>

      {/* Main Content */}
      <div className="p-6 max-w-6xl mx-auto grid grid-cols-2 gap-6">
        {/* Left Column */}
        <div className="flex flex-col gap-6">
          {/* Quick Access Card */}
          <Card className="shadow-sm">
            <h2 className="text-xl font-semibold mb-3">Quick Access</h2>
            <div className="grid grid-cols-3 gap-3">
              {quickAccessItems.map((item) => (
                <button
                  key={item.title}
                  onClick={() => navigate(item.path)}
                  className="rounded-md p-4 flex flex-col items-center gap-2 hover:opacity-90 transition"
                  style={{
                    backgroundColor: "var(--quick-access-background)",
                    border: "1px solid var(--quick-access-border)",
                    color: "var(--quick-access-text)",
                    boxShadow: "var(--quick-access-shadow)",
                    transition: "transform 0.2s ease, box-shadow 0.2s ease",
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.transform = "translateY(-2px)";
                    e.currentTarget.style.boxShadow =
                      "var(--quick-access-shadow-hover)";
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow =
                      "var(--quick-access-shadow)";
                  }}
                >
                  {item.icon}
                  <p className="font-bold">{item.title}</p>
                </button>
              ))}
            </div>
          </Card>

          {/* Market Overview Card */}
          <Card className="shadow-sm">
            <h2 className="text-xl font-semibold mb-4">Market Overview</h2>
            <div className="grid grid-cols-3 gap-3">
              <Card className="p-3">
                <div className="flex items-center gap-2 mb-2">
                  <BarChart size={24} />
                  <p className="font-bold">Market Trend</p>
                </div>
                <p className="text-accent-6 text-lg">Bullish</p>
              </Card>
              <Card className="p-3">
                <div className="flex items-center gap-2 mb-2">
                  <Activity size={24} />
                  <p className="font-bold">Volatility</p>
                </div>
                <p className="text-accent-6 text-lg">Moderate</p>
              </Card>
              <Card className="p-3">
                <div className="flex items-center gap-2 mb-2">
                  <BarChart size={24} />
                  <p className="font-bold">Sentiment</p>
                </div>
                <p className="text-accent-6 text-lg">Neutral</p>
              </Card>
            </div>
          </Card>
        </div>

        {/* Right Column */}
        <div className="flex flex-col gap-6">
          <Card className="shadow-sm">
            <h2 className="text-xl font-semibold mb-3">
              Recently Viewed Terms
            </h2>
            <div className="flex flex-col gap-2">
              {recentTerms.map((term) => (
                <Card key={term.term} className="p-2 flex justify-between">
                  <p>{term.term}</p>
                  <span
                    className="rounded px-2 py-1 text-xs"
                    style={{
                      backgroundColor: "var(--accent)",
                      color: "var(--accent-foreground)",
                    }}
                  >
                    {term.category}
                  </span>
                </Card>
              ))}
            </div>
          </Card>

          <Card className="shadow-sm">
            <h2 className="text-xl font-semibold mb-3">Upcoming Events</h2>
            <div className="flex flex-col gap-2">
              {upcomingEvents.map((event) => (
                <Card key={event.title} className="p-2 flex flex-col gap-1">
                  <p className="font-bold">{event.title}</p>
                  <div className="flex justify-between items-center">
                    <p className="text-sm opacity-70">
                      {new Date(event.date).toLocaleDateString()}
                    </p>
                    <span
                      className="rounded px-2 py-1 text-xs"
                      style={{
                        backgroundColor:
                          event.type === "earnings"
                            ? "var(--green-500)"
                            : event.type === "economic"
                            ? "var(--blue-500)"
                            : "var(--orange-500)",
                        color: "#ffffff",
                      }}
                    >
                      {event.type}
                    </span>
                  </div>
                </Card>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
