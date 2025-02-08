/**
 * File: src/components/NotificationsMenu/NotificationsMenu.tsx
 * Description: Notifications dropdown menu using Radix UI primitives
 */

import { useState } from "react";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { useNavigate } from "react-router-dom";
import { BellIcon, ExternalLinkIcon } from "@radix-ui/react-icons";
import { Box, Flex, Text, Badge, Card } from "@radix-ui/themes";
import styled from "styled-components";
import { useTheme } from "../../theme/hooks/useTheme";
interface Notification {
  id: string;
  type: "price_alert" | "earnings" | "news" | "watchlist" | "analysis";
  title: string;
  description: string;
  timestamp: Date;
  read: boolean;
  actionUrl?: string;
}

const StyledContent = styled(DropdownMenu.Content)`
  min-width: 360px;
  background-color: var(--color-panelSolid);
  border: 1px solid var(--color-borderCard);
  border-radius: var(--radius-3);
  padding: var(--space-2);
  box-shadow: var(--shadow-dropdown);
`;

const StyledItem = styled(DropdownMenu.Item)`
  all: unset;
  display: block;
  padding: var(--space-3);
  border-radius: var(--radius-2);
  cursor: pointer;

  &:hover {
    background-color: var(--color-surface1);
  }

  &:focus {
    background-color: var(--color-surface2);
    outline: none;
  }
`;

export const NotificationsMenu = () => {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: "1",
      type: "price_alert",
      title: "AAPL Price Alert",
      description: "AAPL has crossed above $150",
      timestamp: new Date(),
      read: false,
      actionUrl: "/analysis",
    },
    {
      id: "2",
      type: "earnings",
      title: "Upcoming Earnings",
      description: "MSFT reports earnings tomorrow",
      timestamp: new Date(),
      read: false,
      actionUrl: "/calendar",
    },
  ]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleNotificationClick = (notification: Notification) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === notification.id ? { ...n, read: true } : n))
    );

    if (notification.actionUrl) {
      navigate(notification.actionUrl);
    }
  };

  const handleMarkAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger>
        <Box
          display="inline-block" // Changed from "flex" to "inline-block"
          px="2"
          py="1"
          style={{
            cursor: "pointer",
            position: "relative",
            color: theme.tokens.colors.focusRoot,
          }}
        >
          <BellIcon width={24} height={24} />
          {unreadCount > 0 && (
            <Badge
              variant="solid"
              color="red"
              size="1"
              style={{
                position: "absolute",
                top: "4px",
                right: "4px",
                minWidth: "18px",
                height: "18px",
              }}
            >
              {unreadCount}
            </Badge>
          )}
        </Box>
      </DropdownMenu.Trigger>

      <StyledContent align="end" sideOffset={5}>
        <Box p="3">
          <Flex justify="between" align="center" mb="3">
            <Text size="3" weight="bold">
              Notifications
            </Text>
            {unreadCount > 0 && (
              <Text
                size="2"
                color="blue"
                style={{ cursor: "pointer" }}
                onClick={handleMarkAllRead}
              >
                Mark all as read
              </Text>
            )}
          </Flex>

          {notifications.length > 0 ? (
            <Flex direction="column" gap="2">
              {notifications.map((notification) => (
                <Card
                  key={notification.id}
                  style={{
                    cursor: "pointer",
                    backgroundColor: notification.read
                      ? "var(--color-surface1)"
                      : "var(--color-surface2)",
                  }}
                >
                  <StyledItem
                    onSelect={() => handleNotificationClick(notification)}
                  >
                    <Flex direction="column" gap="1">
                      <Flex justify="between" align="center">
                        <Text weight="bold">{notification.title}</Text>
                        {notification.actionUrl && (
                          <ExternalLinkIcon width={16} height={16} />
                        )}
                      </Flex>
                      <Text size="2" color="gray">
                        {notification.description}
                      </Text>
                      <Text size="1" color="gray">
                        {notification.timestamp.toLocaleTimeString()}
                      </Text>
                    </Flex>
                  </StyledItem>
                </Card>
              ))}
            </Flex>
          ) : (
            <Flex
              align="center"
              justify="center"
              py="6"
              style={{ color: "var(--gray-11)" }}
            >
              <Text size="2">No notifications</Text>
            </Flex>
          )}
        </Box>
      </StyledContent>
    </DropdownMenu.Root>
  );
};
