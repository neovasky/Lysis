/**
 * File: src/pages/Home/HomePage.tsx
 * Description: Main dashboard/home page component
 */

import { useState } from "react";
import {
  Box,
  Grid,
  Paper,
  Typography,
  Card,
  CardContent,
  CardActionArea,
  Stack,
  Chip,
} from "@mui/material";
import {
  MenuBook as MenuBookIcon,
  Notifications as NotificationsIcon,
  Folder as FolderIcon,
  CalendarMonth as CalendarMonthIcon,
  Notes as NotesIcon,
  TrendingUp as TrendingUpIcon,
  Timeline as TimelineIcon,
  ShowChart as ShowChartIcon,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";

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
      icon: <MenuBookIcon sx={{ fontSize: 32 }} />,
      path: "/glossary",
      color: "primary",
    },
    {
      title: "Alerts",
      icon: <NotificationsIcon sx={{ fontSize: 32 }} />,
      path: "/alerts",
      color: "error",
    },
    {
      title: "Files",
      icon: <FolderIcon sx={{ fontSize: 32 }} />,
      path: "/files",
      color: "success",
    },
    {
      title: "Calendar",
      icon: <CalendarMonthIcon sx={{ fontSize: 32 }} />,
      path: "/calendar",
      color: "warning",
    },
    {
      title: "Research",
      icon: <NotesIcon sx={{ fontSize: 32 }} />,
      path: "/notes",
      color: "info",
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
    <Box sx={{ p: 3 }}>
      <Grid container spacing={3}>
        {/* Welcome Section */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h5" gutterBottom fontWeight={600}>
              Welcome to Lysis
            </Typography>
            <Typography color="text.secondary">
              Your personal investment research and analysis workspace
            </Typography>
          </Paper>
        </Grid>

        {/* Quick Access Grid */}
        <Grid item xs={12} md={8}>
          <Typography variant="h6" gutterBottom sx={{ px: 1 }}>
            Quick Access
          </Typography>
          <Grid container spacing={2}>
            {quickAccessItems.map((item) => (
              <Grid item xs={6} sm={4} key={item.title}>
                <Card
                  sx={{
                    height: "100%",
                    backgroundColor: "rgba(144, 202, 249, 0.08)",
                  }}
                >
                  <CardActionArea
                    onClick={() => navigate(item.path)}
                    sx={{
                      height: "100%",
                      p: 2,
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                    }}
                  >
                    {item.icon}
                    <Typography
                      variant="subtitle1"
                      sx={{ mt: 1, fontWeight: 500 }}
                    >
                      {item.title}
                    </Typography>
                  </CardActionArea>
                </Card>
              </Grid>
            ))}
          </Grid>

          {/* Market Overview Section */}
          <Typography variant="h6" gutterBottom sx={{ px: 1, mt: 4 }}>
            Market Overview
          </Typography>
          <Paper sx={{ p: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={4}>
                <Card sx={{ backgroundColor: "rgba(144, 202, 249, 0.08)" }}>
                  <CardContent>
                    <Stack
                      direction="row"
                      alignItems="center"
                      spacing={1}
                      sx={{ mb: 1 }}
                    >
                      <TrendingUpIcon color="primary" />
                      <Typography variant="subtitle2">Market Trend</Typography>
                    </Stack>
                    <Typography variant="h6" color="primary">
                      Bullish
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Card sx={{ backgroundColor: "rgba(144, 202, 249, 0.08)" }}>
                  <CardContent>
                    <Stack
                      direction="row"
                      alignItems="center"
                      spacing={1}
                      sx={{ mb: 1 }}
                    >
                      <TimelineIcon color="primary" />
                      <Typography variant="subtitle2">Volatility</Typography>
                    </Stack>
                    <Typography variant="h6" color="primary">
                      Moderate
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Card sx={{ backgroundColor: "rgba(144, 202, 249, 0.08)" }}>
                  <CardContent>
                    <Stack
                      direction="row"
                      alignItems="center"
                      spacing={1}
                      sx={{ mb: 1 }}
                    >
                      <ShowChartIcon color="primary" />
                      <Typography variant="subtitle2">Sentiment</Typography>
                    </Stack>
                    <Typography variant="h6" color="primary">
                      Neutral
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        {/* Right Side Panels */}
        <Grid item xs={12} md={4}>
          {/* Recently Viewed Terms */}
          <Paper sx={{ p: 2, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Recently Viewed Terms
            </Typography>
            <Stack spacing={1}>
              {recentTerms.map((term) => (
                <Box
                  key={term.term}
                  sx={{
                    p: 1.5,
                    borderRadius: 1,
                    backgroundColor: "rgba(144, 202, 249, 0.08)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <Typography>{term.term}</Typography>
                  <Chip
                    label={term.category}
                    size="small"
                    sx={{ backgroundColor: "rgba(144, 202, 249, 0.16)" }}
                  />
                </Box>
              ))}
            </Stack>
          </Paper>

          {/* Upcoming Events */}
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Upcoming Events
            </Typography>
            <Stack spacing={1}>
              {upcomingEvents.map((event) => (
                <Box
                  key={event.title}
                  sx={{
                    p: 1.5,
                    borderRadius: 1,
                    backgroundColor: "rgba(144, 202, 249, 0.08)",
                  }}
                >
                  <Typography variant="subtitle2" gutterBottom>
                    {event.title}
                  </Typography>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Typography variant="caption" color="text.secondary">
                      {new Date(event.date).toLocaleDateString()}
                    </Typography>
                    <Chip
                      label={event.type}
                      size="small"
                      sx={{
                        backgroundColor:
                          event.type === "earnings"
                            ? "rgba(76, 175, 80, 0.16)"
                            : event.type === "economic"
                            ? "rgba(33, 150, 243, 0.16)"
                            : "rgba(255, 152, 0, 0.16)",
                      }}
                    />
                  </Stack>
                </Box>
              ))}
            </Stack>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};
