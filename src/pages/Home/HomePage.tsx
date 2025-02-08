/**
 * File: src/pages/Home/HomePage.tsx
 * Description: Main dashboard/home page component using Radix UI
 */

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Container,
  Card,
  Grid,
  Heading,
  Text,
  Box,
  Flex,
  Badge,
} from "@radix-ui/themes";
import {
  BookmarkIcon,
  BellIcon,
  FileIcon,
  CalendarIcon,
  FileTextIcon,
  ActivityLogIcon,
  BarChartIcon,
} from "@radix-ui/react-icons";

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
      icon: <BookmarkIcon width={24} height={24} />,
      path: "/glossary",
    },
    {
      title: "Alerts",
      icon: <BellIcon width={24} height={24} />,
      path: "/alerts",
    },
    {
      title: "Files",
      icon: <FileIcon width={24} height={24} />,
      path: "/files",
    },
    {
      title: "Calendar",
      icon: <CalendarIcon width={24} height={24} />,
      path: "/calendar",
    },
    {
      title: "Research",
      icon: <FileTextIcon width={24} height={24} />,
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
    <Container size="4" p="4">
      {/* Welcome Section */}
      <Card size="2" mb="4">
        <Heading size="6" mb="2">
          Welcome to Lysis
        </Heading>
        <Text color="gray" size="2">
          Your personal investment research and analysis workspace
        </Text>
      </Card>

      <Grid columns="3" gap="4">
        {/* Quick Access Grid */}
        <Box style={{ gridColumn: "span 2" }}>
          <Heading size="4" mb="4">
            Quick Access
          </Heading>
          <Grid columns="3" gap="3">
            {quickAccessItems.map((item) => (
              <Card
                key={item.title}
                asChild
                style={{ cursor: "pointer" }}
                onClick={() => navigate(item.path)}
              >
                <Flex direction="column" align="center" gap="2" p="4">
                  {item.icon}
                  <Text weight="bold">{item.title}</Text>
                </Flex>
              </Card>
            ))}
          </Grid>

          {/* Market Overview */}
          <Heading size="4" mt="6" mb="4">
            Market Overview
          </Heading>
          <Grid columns="3" gap="3">
            <Card>
              <Flex align="center" gap="2" mb="2">
                <BarChartIcon />
                <Text weight="bold">Market Trend</Text>
              </Flex>
              <Text size="5" color="blue">
                Bullish
              </Text>
            </Card>
            <Card>
              <Flex align="center" gap="2" mb="2">
                <ActivityLogIcon />
                <Text weight="bold">Volatility</Text>
              </Flex>
              <Text size="5" color="blue">
                Moderate
              </Text>
            </Card>
            <Card>
              <Flex align="center" gap="2" mb="2">
                <BarChartIcon />
                <Text weight="bold">Sentiment</Text>
              </Flex>
              <Text size="5" color="blue">
                Neutral
              </Text>
            </Card>
          </Grid>
        </Box>

        {/* Right Side Panels */}
        <Box>
          {/* Recently Viewed Terms */}
          <Card mb="4">
            <Heading size="3" mb="3">
              Recently Viewed Terms
            </Heading>
            <Flex direction="column" gap="2">
              {recentTerms.map((term) => (
                <Card key={term.term} variant="surface">
                  <Flex justify="between" align="center">
                    <Text>{term.term}</Text>
                    <Badge>{term.category}</Badge>
                  </Flex>
                </Card>
              ))}
            </Flex>
          </Card>

          {/* Upcoming Events */}
          <Card>
            <Heading size="3" mb="3">
              Upcoming Events
            </Heading>
            <Flex direction="column" gap="2">
              {upcomingEvents.map((event) => (
                <Card key={event.title} variant="surface">
                  <Text weight="bold" mb="1">
                    {event.title}
                  </Text>
                  <Flex justify="between" align="center">
                    <Text size="1" color="gray">
                      {new Date(event.date).toLocaleDateString()}
                    </Text>
                    <Badge
                      color={
                        event.type === "earnings"
                          ? "green"
                          : event.type === "economic"
                          ? "blue"
                          : "orange"
                      }
                    >
                      {event.type}
                    </Badge>
                  </Flex>
                </Card>
              ))}
            </Flex>
          </Card>
        </Box>
      </Grid>
    </Container>
  );
};
